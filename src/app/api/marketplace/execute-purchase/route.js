import { ethers } from 'ethers';
import { supabase } from '@/lib/supabase/supabaseClient';

// Core testnet configuration (tcore2)
const CORE_RPC_URL = process.env.CORE_RPC_URL || "https://rpc.test2.btcs.network";

// Contract and operator config
const CREATURE_NFT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const MARKET_OPERATOR_PK = process.env.MARKET_OPERATOR_PK || ""; // server-only private key
const MARKET_OPERATOR_ADDRESS = process.env.NEXT_PUBLIC_MARKET_OPERATOR || ""; // public address for approval UI

// Use the full contract ABI from the deployed contract
const CREATURE_NFT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { listingId, buyer, paymentTxHash } = body || {};
    
    if (!listingId || !buyer || !paymentTxHash) {
      return new Response(JSON.stringify({ error: 'Missing listingId, buyer, or paymentTxHash' }), { status: 400 });
    }

    if (!CORE_RPC_URL || !CREATURE_NFT_ADDRESS || !MARKET_OPERATOR_PK) {
      return new Response(JSON.stringify({ error: 'Server not configured: missing CORE_RPC_URL / NEXT_PUBLIC_CONTRACT_ADDRESS / MARKET_OPERATOR_PK' }), { status: 500 });
    }

    // Validate private key format
    if (!MARKET_OPERATOR_PK.startsWith('0x') || MARKET_OPERATOR_PK.length !== 66) {
      return new Response(JSON.stringify({ error: 'Invalid MARKET_OPERATOR_PK format. Must be a 64-character hex string starting with 0x' }), { status: 500 });
    }

         // Get the listing from Supabase (can be active or sold, but not removed)
     const { data: listing, error: fetchError } = await supabase
       .from('marketplace')
       .select('*')
       .eq('id', listingId)
       .single();

     if (fetchError || !listing) {
       return new Response(JSON.stringify({ error: 'Listing not found' }), { status: 404 });
     }

     console.log('Listing status:', listing.status, 'Seller:', listing.seller, 'Token ID:', listing.token_id);

    // If already sold, check if it was sold to this buyer
    if (listing.status === 'sold') {
      if (String(listing.buyer).toLowerCase() !== String(buyer).toLowerCase()) {
        return new Response(JSON.stringify({ error: 'Listing already sold to another buyer' }), { status: 400 });
      }
      // If already sold to this buyer, just return success (NFT transfer already completed)
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Purchase already completed',
        listing 
      }), { status: 200 });
    }

    // Prevent self-buy
    if (String(listing.seller).toLowerCase() === String(buyer).toLowerCase()) {
      return new Response(JSON.stringify({ error: 'You cannot buy your own listing' }), { status: 400 });
    }

    // Initialize provider and contract instances with explicit network config
    const provider = new ethers.JsonRpcProvider(CORE_RPC_URL, {
      chainId: 1116,
      name: "Core Mainnet",
      ensAddress: null // Disable ENS resolution
    });
    
         const nftReader = new ethers.Contract(CREATURE_NFT_ADDRESS, CREATURE_NFT_ABI, provider);
     
     // Check if the marketplace operator is set in the contract
     try {
       // Try to call a function that would only exist in the new contract
       const operatorCheckData = nftReader.interface.encodeFunctionData('isApprovedForAll', [listing.seller, MARKET_OPERATOR_ADDRESS]);
       await provider.call({ to: CREATURE_NFT_ADDRESS, data: operatorCheckData });
       console.log('Contract supports isApprovedForAll - likely the new contract with built-in operator');
     } catch (operatorCheckError) {
       console.warn('Contract might not support isApprovedForAll - could be old contract:', operatorCheckError?.message);
     }

    // 1) Verify payment transaction on-chain (native CORE sent from buyer to seller with exact price)
    const tx = await provider.getTransaction(paymentTxHash);
    if (!tx) {
      return new Response(JSON.stringify({ error: 'Payment transaction not found' }), { status: 400 });
    }
    // Wait until mined
    const receipt = await provider.waitForTransaction(paymentTxHash, 1, 60_000).catch(() => null);
    if (!receipt || receipt.status !== 1) {
      return new Response(JSON.stringify({ error: 'Payment transaction not confirmed' }), { status: 400 });
    }
    // Validate from/to/value
    const expectedWei = ethers.parseEther(String(listing.price));
    const txFrom = String(tx.from).toLowerCase();
    const txTo = String(tx.to).toLowerCase();
    const sellerLower = String(listing.seller).toLowerCase();
    const buyerLower = String(buyer).toLowerCase();

    if (txFrom !== buyerLower || txTo !== sellerLower) {
      return new Response(JSON.stringify({ error: 'Payment transaction parties mismatch' }), { status: 400 });
    }
    if (tx.value !== expectedWei) {
      return new Response(JSON.stringify({ error: 'Payment amount does not match listing price' }), { status: 400 });
    }

         // 2) Verify seller still owns the token
     const owner = await nftReader.ownerOf(listing.token_id);
     console.log(`Token ${listing.token_id} current owner: ${owner}, expected seller: ${listing.seller}`);
     
     if (String(owner).toLowerCase() === '0x0000000000000000000000000000000000000000') {
       return new Response(JSON.stringify({ error: 'Token appears to be burned or non-existent' }), { status: 400 });
     }
     
     if (String(owner).toLowerCase() !== sellerLower) {
       return new Response(JSON.stringify({ 
         error: 'Seller no longer owns the token',
         currentOwner: owner,
         expectedSeller: listing.seller
       }), { status: 400 });
     }

         // 3) Verify operator approval using low-level calls to avoid ENS resolution
     try {
       const iface = nftReader.interface;
       
       // Check if the contract has the built-in operator functionality
       const approvedAllData = iface.encodeFunctionData('isApprovedForAll', [listing.seller, MARKET_OPERATOR_ADDRESS]);
       const approvedAllRaw = await provider.call({ to: CREATURE_NFT_ADDRESS, data: approvedAllData });
       const approvedAll = iface.decodeFunctionResult('isApprovedForAll', approvedAllRaw)[0];
       
       console.log(`Token ${listing.token_id} approval status:`, {
         approvedAll: approvedAll,
         operator: MARKET_OPERATOR_ADDRESS
       });
       
       if (!approvedAll) {
         return new Response(JSON.stringify({
           error: 'Marketplace operator is not approved. This might mean the contract does not have the built-in operator functionality or the operator is not set correctly.'
         }), { status: 400 });
       }
       
       console.log('Approval verification successful');
     } catch (approvalErr) {
       console.warn('Approval verification failed, continuing. Error:', approvalErr?.message || approvalErr);
       // Continue anyway since the new contract should auto-approve the operator
     }

    // 4) Attempt NFT transfer using operator signer (simulate first)
    console.log('Attempting NFT transfer...');
    
    try {
      const operatorWallet = new ethers.Wallet(MARKET_OPERATOR_PK, provider);
      const nftOperator = new ethers.Contract(CREATURE_NFT_ADDRESS, CREATURE_NFT_ABI, operatorWallet);

      // Simulate to catch immediate reverts with decodeable reasons
      try {
        await nftOperator.transferFrom.staticCall(listing.seller, buyer, listing.token_id);
      } catch (simErr) {
        let reason = simErr?.message || 'transfer simulation failed';
        try {
          const data = simErr?.data || simErr?.error?.data;
          if (data) {
            const parsed = nftOperator.interface.parseError(data);
            if (parsed) reason = parsed?.name || reason;
          }
        } catch {}
        return new Response(JSON.stringify({ error: `Transfer would revert: ${reason}` }), { status: 400 });
      }

             // Send tx
       let transferTx;
       try {
         console.log(`Attempting transferFrom: ${listing.seller} -> ${buyer}, tokenId: ${listing.token_id}`);
         transferTx = await nftOperator.transferFrom(listing.seller, buyer, listing.token_id, { 
           gasLimit: 200_000 
         });
         console.log('transferFrom sent, waiting for confirmation...');
       } catch (transferError) {
         console.log('transferFrom failed to send, trying safeTransferFrom:', transferError?.message);
         try {
           transferTx = await nftOperator.safeTransferFrom(listing.seller, buyer, listing.token_id, { 
             gasLimit: 250_000 
           });
           console.log('safeTransferFrom sent, waiting for confirmation...');
         } catch (safeTransferError) {
           console.error('Both transferFrom and safeTransferFrom failed:', safeTransferError);
           throw safeTransferError;
         }
       }
       
       if (!transferTx) {
         throw new Error('Failed to create transfer transaction');
       }
       
       console.log('Waiting for transfer transaction confirmation...');
       const transferRcpt = await transferTx.wait();
       console.log('Transfer receipt:', transferRcpt);
       
              if (!transferRcpt || transferRcpt.status !== 1) {
         console.error('Transfer transaction failed with receipt:', transferRcpt);
         return new Response(JSON.stringify({ error: 'Transfer transaction failed' }), { status: 500 });
       }

       // 5) Verify the transfer actually happened on-chain
       console.log('Verifying transfer on-chain...');
       try {
         const newOwner = await nftReader.ownerOf(listing.token_id);
         console.log(`Token ${listing.token_id} new owner: ${newOwner}, expected: ${buyer}`);
         
         if (String(newOwner).toLowerCase() === String(listing.seller).toLowerCase()) {
           console.error('Transfer failed - token still owned by seller');
           return new Response(JSON.stringify({ error: 'NFT transfer failed - token still owned by seller' }), { status: 500 });
         }
         
         if (String(newOwner).toLowerCase() === '0x0000000000000000000000000000000000000000') {
           console.error('Transfer failed - token burned or stuck (zero address owner)');
           return new Response(JSON.stringify({ error: 'NFT transfer failed - token appears to be burned or stuck' }), { status: 500 });
         }
         
         if (String(newOwner).toLowerCase() !== String(buyer).toLowerCase()) {
           console.error(`Transfer verification failed - token owned by unexpected address: ${newOwner}`);
           return new Response(JSON.stringify({ 
             error: 'NFT transfer verification failed - token ownership not updated correctly',
             currentOwner: newOwner,
             expectedOwner: buyer
           }), { status: 500 });
         }
         
         console.log('Transfer verification successful');
       } catch (verifyError) {
         console.error('Failed to verify transfer:', verifyError);
         return new Response(JSON.stringify({ error: 'Failed to verify NFT transfer' }), { status: 500 });
       }

              // 6) Update Supabase listing -> sold
       const { error: updateError } = await supabase
         .from('marketplace')
         .update({ 
           status: 'sold',
           buyer: buyer,
           sold_at: new Date().toISOString(),
           transaction_hash: String(transferTx.hash),
           payment_tx_hash: String(paymentTxHash)
         })
         .eq('id', listingId);

       if (updateError) {
         console.error('Failed to update listing status:', updateError);
         // Note: NFT transfer already happened, so we can't easily rollback
         // The user will need to contact support to manually fix the listing status
         return new Response(JSON.stringify({ 
           error: 'NFT transferred but failed to update listing status. Please contact support.',
           transferTxHash: transferTx.hash,
           note: 'The NFT was successfully transferred to your wallet despite this error.'
         }), { status: 500 });
       }

      return new Response(JSON.stringify({ 
        success: true,
        listingId,
        paymentTxHash,
        transferTxHash: transferTx.hash,
        receipt: { blockNumber: transferRcpt.blockNumber }
      }), { status: 200 });

    } catch (transferError) {
      console.error('NFT transfer failed:', transferError);
      
      return new Response(JSON.stringify({ 
        error: 'NFT transfer failed: ' + (transferError?.message || String(transferError)) 
      }), { status: 500 });
    }

  } catch (err) {
    console.error('Execute purchase error:', err);
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
