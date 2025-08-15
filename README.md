# 🐉 Kryptz - NFT Creature Battle Game

A decentralized NFT creature collection and battle game built on Core Blockchain. Collect, train, evolve, and battle unique creatures in an on-chain gaming experience.

## 🌟 Features

- **NFT Creatures**: Mint and collect unique creatures with randomized traits
- **Marketplace**: Buy, sell, and trade creatures with other players
- **Training System**: Improve creature stats using training tokens
- **Evolution System**: Evolve creatures to unlock new forms and abilities
- **Battle System**: Engage in strategic battles with other players
- **Quest System**: Complete daily quests to earn rewards
- **IPFS Storage**: Decentralized metadata storage using Pinata

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- Core Blockchain network configured in your wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kryptz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Core Mainnet Configuration
   CORE_RPC_URL=https://rpc.ankr.com/core
   NEXT_PUBLIC_CONTRACT_ADDRESS=<your-deployed-contract-address>
   
   # Marketplace Operator (for NFT transfers)
   MARKET_OPERATOR_PK=<your-operator-private-key>
   NEXT_PUBLIC_MARKET_OPERATOR=<your-operator-address>
   
   # IPFS/Pinata Configuration
   PINATA_API_KEY=<your-pinata-api-key>
   PINATA_SECRET_API_KEY=<your-pinata-secret-key>
   PINATA_JWT=<your-pinata-jwt-token>
   GATEWAY_URL=<your-pinata-gateway-url>
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   ```

4. **Run the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Core Blockchain Network

Add Core mainnet to your MetaMask wallet:

- **Network Name**: Core Blockchain
- **RPC URL**: https://rpc.ankr.com/core
- **Chain ID**: 1116
- **Currency Symbol**: CORE
- **Block Explorer**: https://scan.coredao.org

### Smart Contract Deployment

1. **Deploy to Core mainnet**
   ```bash
   npx hardhat run scripts/deploy.js --network coremainnet
   ```

2. **Set market operator** (if not set during deployment)
   ```bash
   npx hardhat console --network coremainnet
   > const contract = await ethers.getContractAt("CreatureNFT", "<contract-address>")
   > await contract.setMarketOperator("<operator-address>")
   ```

## 🏗️ Architecture

### Smart Contracts

- **CreatureNFT.sol**: ERC721 contract for creature NFTs with built-in marketplace operator
- **BattleGame.sol**: Battle system contract for creature combat

### Frontend

- **Next.js 14**: React framework with App Router
- **Wagmi**: React hooks for Ethereum
- **Ethers.js**: Ethereum library for blockchain interaction
- **NES.css**: Retro gaming UI framework

### Backend

- **Supabase**: Database and authentication
- **IPFS/Pinata**: Decentralized metadata storage
- **API Routes**: Next.js API endpoints for marketplace operations

### Key Components

- **Marketplace**: Buy/sell creatures with real CORE transactions
- **Creature Collection**: View and manage owned creatures
- **Training System**: Improve creature stats
- **Evolution System**: Unlock new creature forms
- **Battle Arena**: Strategic combat system
- **Quest System**: Daily challenges and rewards

## 🎮 How to Play

### Getting Started

1. **Connect Wallet**: Connect your Web3 wallet to the game
2. **Mint First Creature**: Create your first NFT creature
3. **Explore Features**: Train, evolve, and battle your creatures

### Creature Management

- **Minting**: Create new creatures with randomized traits
- **Training**: Use training tokens to improve stats
- **Evolution**: Evolve creatures to unlock new forms
- **Trading**: Buy and sell creatures in the marketplace

### Battle System

- **Matchmaking**: Find opponents for battles
- **Strategy**: Use creature stats and abilities strategically
- **Rewards**: Earn rewards for successful battles

## 🔒 Security Features

- **Built-in Marketplace Operator**: No need for individual user approvals
- **On-chain Verification**: All transactions verified on Core blockchain
- **Secure Transfers**: Operator-controlled NFT transfers
- **Payment Verification**: Native CORE payment validation

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```

3. **Set production environment variables**
   - Update contract addresses for mainnet
   - Configure production Supabase instance
   - Set production Pinata credentials

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CORE_RPC_URL` | Core blockchain RPC endpoint | Yes |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed CreatureNFT contract | Yes |
| `MARKET_OPERATOR_PK` | Private key for marketplace operator | Yes |
| `NEXT_PUBLIC_MARKET_OPERATOR` | Public address of marketplace operator | Yes |
| `PINATA_API_KEY` | Pinata IPFS API key | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions on GitHub
- **Discord**: Join our Discord server for real-time support

## 🔗 Links

- **Website**: [https://kryptz.game](https://kryptz.game)
- **Core Blockchain**: [https://coredao.org](https://coredao.org)
- **Documentation**: [https://docs.coredao.org](https://docs.coredao.org)
- **Block Explorer**: [https://scan.coredao.org](https://scan.coredao.org)

## 🎯 Roadmap

- [ ] Enhanced battle mechanics
- [ ] More creature types and evolutions
- [ ] Guild system
- [ ] Tournament mode
- [ ] Mobile app
- [ ] Cross-chain compatibility

---

**Built with ❤️ on Core Blockchain**
