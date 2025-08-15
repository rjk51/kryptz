# Marketplace Setup Guide

This guide will help you set up the marketplace feature for Kryptz on Core Mainnet.

## Prerequisites

1. **Supabase Project**: You need a Supabase project with the marketplace table created
2. **Core Mainnet Configuration**: Your project should be configured to work with Core mainnet (chain ID 1116)
3. **Environment Variables**: Ensure all required environment variables are set

## Step 1: Set Up Supabase

### 1.1 Create the Marketplace Table

Run the following SQL in your Supabase SQL editor:

```sql
-- Run this in your Supabase SQL editor to create the marketplace table

CREATE TABLE IF NOT EXISTS marketplace (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller TEXT NOT NULL,
  token_id TEXT NOT NULL,
  price DECIMAL(18,8) NOT NULL,
  currency TEXT DEFAULT 'CORE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  transaction_hash TEXT,
  buyer TEXT,
  sold_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace(seller);
CREATE INDEX IF NOT EXISTS idx_marketplace_token_id ON marketplace(token_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_created_at ON marketplace(created_at);

-- Note: RLS is disabled for now since we're handling security at the API level
-- You can enable it later when you implement proper Supabase authentication

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_marketplace_updated_at 
  BEFORE UPDATE ON marketplace 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 1.2 Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
CORE_RPC_URL=https://rpc.ankr.com/core
NEXT_PUBLIC_CONTRACT_ADDRESS=your_creature_nft_contract_address
```

## Step 2: Features Implemented

### ✅ What's Working

1. **User Listings**: Users can list their creatures for sale
2. **Supabase Integration**: All listings are stored in Supabase
3. **Real-time Updates**: Listings update in real-time across all users
4. **Token Validation**: Prevents duplicate listings and invalid tokens
5. **Purchase System**: Users can buy listed creatures
6. **Core Mainnet Ready**: Configured for Core mainnet transactions

### 🔄 What's Partially Implemented

1. **Blockchain Transactions**: The infrastructure is ready, but actual NFT transfers need to be implemented
2. **Payment System**: CORE token transfers between buyer and seller need to be implemented

## Step 3: Testing the Marketplace

### 3.1 List a Creature

1. Connect your wallet
2. Go to the Marketplace tab
3. Click "LIST CREATURE"
4. Select a token you own
5. Set a price in CORE
6. Click "LIST"

### 3.2 Buy a Creature

1. Browse active listings
2. Click "BUY" on a listing you want
3. Confirm the purchase
4. The listing will be marked as sold

## Step 4: Next Steps for Full Implementation

### 4.1 Implement NFT Transfer

Update the `execute-purchase` endpoint to handle actual NFT transfers:

```javascript
// In src/app/api/marketplace/execute-purchase/route.js
// Replace the placeholder transfer logic with actual contract calls
```

### 4.2 Implement Payment System

Add CORE token transfer functionality:

```javascript
// Transfer CORE tokens from buyer to seller
// Handle marketplace fees
// Record payment transaction hashes
```

### 4.3 Add Transaction Signing

Implement frontend transaction signing:

```javascript
// User signs the transaction on the frontend
// Send signed transaction to the backend
// Execute the transaction on Core testnet
```

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**: Check your environment variables
2. **Contract Not Found**: Verify your contract address is correct
3. **Transaction Failures**: Ensure you have enough CORE tokens for gas fees
4. **RLS Policy Errors**: If you encounter RLS errors, ensure the table was created without RLS enabled

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

## Security Notes

- **API-Level Security**: Security is currently handled at the API level rather than database level
- **Future Enhancement**: You can enable RLS later when implementing proper Supabase authentication
- **Input Validation**: All user inputs are validated in the API endpoints

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your Supabase table structure
3. Ensure your Core testnet configuration is correct
4. Check that your smart contracts are deployed and accessible

## Notes

- The marketplace currently shows only user listings (no hardcoded creatures)
- All transactions are recorded in Supabase
- The system is designed to be scalable and secure
- Security is handled at the API level for now
