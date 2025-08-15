# 🚀 Deployment Guide - Core Mainnet

This guide will walk you through deploying Kryptz to Core mainnet.

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Core mainnet wallet with CORE for gas fees
- Hardhat configured for Core mainnet
- Environment variables set up

## 🔧 Configuration

### 1. Update Environment Variables

Ensure your `.env.local` has the correct mainnet configuration:

```env
# Core Mainnet Configuration
CORE_RPC_URL=https://rpc.ankr.com/core
NEXT_PUBLIC_CONTRACT_ADDRESS=<will-be-set-after-deployment>

# Marketplace Operator
MARKET_OPERATOR_PK=<your-operator-private-key>
NEXT_PUBLIC_MARKET_OPERATOR=<your-operator-address>

# Other required variables...
```

### 2. Fund Your Deployment Wallet

Make sure your deployment wallet has sufficient CORE for:
- Contract deployment (~0.1-0.5 CORE)
- Setting market operator (~0.01 CORE)
- Gas fees for initial transactions

### 3. Fund Your Market Operator Wallet

The market operator wallet needs CORE for:
- NFT transfer gas fees
- Marketplace operations

## 🏗️ Smart Contract Deployment

### 1. Deploy CreatureNFT Contract

```bash
# Deploy to Core mainnet
npx hardhat run scripts/deploy.js --network coremainnet
```

**Expected Output:**
```
Deploying contracts with: 0x...
✅ CreatureNFT deployed to: 0x...
✅ Market operator set to: 0x...

🚀 Deployment Summary:
📋 Contract: CreatureNFT
📍 Address: 0x...
🔗 Network: Core Mainnet (Chain ID: 1116)
👤 Owner: 0x...
🏪 Market Operator: 0x...

💡 Next steps:
1. Update your .env.local with NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
2. Fund the market operator wallet with CORE for gas fees
3. Test the marketplace functionality
```

### 2. Update Environment Variables

After successful deployment, update your `.env.local`:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # Your deployed contract address
```

### 3. Verify Contract on Core Scan

1. Go to [https://scan.coredao.org](https://scan.coredao.org)
2. Search for your contract address
3. Verify the contract source code (optional but recommended)

## 🧪 Testing Deployment

### 1. Test Contract Functions

```bash
# Connect to Hardhat console
npx hardhat console --network coremainnet

# Test basic functions
> const contract = await ethers.getContractAt("CreatureNFT", "<contract-address>")
> await contract.name()
> await contract.symbol()
> await contract.owner()
```

### 2. Test Market Operator

```bash
# Check if market operator is set
> await contract.isApprovedForAll("<seller-address>", "<operator-address>")
```

## 🌐 Frontend Deployment

### 1. Build for Production

```bash
npm run build
```

### 2. Deploy to Vercel

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Set Production Environment Variables

In your Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add all required variables from `.env.local`
- Ensure `NODE_ENV=production`

## 🔍 Post-Deployment Verification

### 1. Contract Verification

- [ ] Contract deployed successfully
- [ ] Market operator set correctly
- [ ] Contract functions working
- [ ] Gas fees reasonable

### 2. Frontend Verification

- [ ] Website loads without errors
- [ ] Wallet connection works
- [ ] Contract interaction functional
- [ ] Marketplace operations working

### 3. Integration Testing

- [ ] User can mint creatures
- [ ] User can list creatures
- [ ] User can buy creatures
- [ ] NFT transfers complete successfully

## 🚨 Troubleshooting

### Common Issues

1. **Insufficient Gas**
   - Ensure wallet has enough CORE for deployment
   - Check gas limit settings

2. **Contract Deployment Fails**
   - Verify RPC URL is correct
   - Check network configuration
   - Ensure private key is valid

3. **Market Operator Not Set**
   - Manually set via Hardhat console
   - Verify operator address is correct

4. **Frontend Errors**
   - Check environment variables
   - Verify contract address
   - Check browser console for errors

### Support

- Check [Core Blockchain documentation](https://docs.coredao.org)
- Review [Hardhat documentation](https://hardhat.org/docs)
- Check GitHub Issues for known problems

## 🔐 Security Considerations

1. **Private Keys**
   - Never commit private keys to version control
   - Use environment variables for sensitive data
   - Consider using hardware wallets for production

2. **Access Control**
   - Verify contract ownership
   - Review market operator permissions
   - Test access control functions

3. **Gas Optimization**
   - Monitor gas usage
   - Optimize contract functions
   - Set reasonable gas limits

## 📊 Monitoring

### 1. Core Scan
- Monitor contract transactions
- Track gas usage
- View contract events

### 2. Application Logs
- Monitor API endpoints
- Track user interactions
- Monitor error rates

### 3. Performance Metrics
- Page load times
- Transaction success rates
- User engagement metrics

---

**🎯 Ready to deploy? Follow this guide step by step and you'll have Kryptz running on Core mainnet in no time!**
