# 🏃‍♂️ Avalanche Runners

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-blueviolet)](https://hardhat.org/)
[![Avalanche](https://img.shields.io/badge/Powered%20by-Avalanche-orange)](https://www.avax.network/)

Avalanche Runners is a blockchain-based endless runner game built on the Avalanche network, combining engaging gameplay with play-to-earn mechanics. Collect $RUN tokens, upgrade NFT characters, and compete in a vibrant in-game economy.

## 🎮 Features

- **Play-to-Earn**: Earn $RUN tokens through gameplay and achievements
- **NFT Characters**: Collect and upgrade characters with unique abilities
- **Staking Rewards**: Earn passive income by staking tokens and NFTs
- **Dynamic Economy**: Balanced tokenomics with built-in deflationary mechanisms
- **Cross-Platform**: Play on both web and mobile devices

## 🛠️ Tech Stack

- **Blockchain**: Avalanche C-Chain
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Frontend**: React, Three.js, Web3.js
- **NFTs**: ERC-721 for characters, ERC-20 for $RUN token

## 📦 Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- [MetaMask](https://metamask.io/) or other Web3 wallet
- [Avalanche C-Chain](https://docs.avax.network/quickstart/fund-a-fuji-test-address-with-the-avalanche-faucet) testnet tokens for testing

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/avalanche-runners.git
   cd avalanche-runners
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Update the values in .env
   ```

4. **Compile contracts**
   ```bash
   npx hardhat compile
   ```

5. **Run tests**
   ```bash
   npx hardhat test
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 📄 Documentation

- [Tokenomics](./tokenomics.md)
- [Smart Contract Architecture](./docs/architecture.md) (coming soon)
- [Frontend Documentation](./frontend/README.md) (coming soon)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Avalanche](https://www.avax.network/) for the amazing blockchain platform
- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Hardhat](https://hardhat.org/) for the development environment
