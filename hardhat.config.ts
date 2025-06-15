import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import "solidity-coverage";
import "hardhat-gas-reporter";
import "@typechain/hardhat";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";

dotenv.config();

// Ensure we have all the environment variables we need
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const FUJI_PRIVATE_KEY = process.env.FUJI_PRIVATE_KEY || "";
const AVALANCHE_PRIVATE_KEY = process.env.AVALANCHE_PRIVATE_KEY || "";
const SNOWTRACE_API_KEY = process.env.SNOWTRACE_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    // Local network configuration
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true,
    },
    localhost: {
      chainId: 31337,
      url: "http://127.0.0.1:8545/",
      allowUnlimitedContractSize: true,
    },
    // Avalanche Fuji Testnet
    fuji: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc',
      gasPrice: 'auto',
      chainId: 43113,
      accounts: FUJI_PRIVATE_KEY ? [FUJI_PRIVATE_KEY] : [],
    },
    // Avalanche Mainnet
    avalanche: {
      url: 'https://api.avax.network/ext/bc/C/rpc',
      gasPrice: 'auto',
      chainId: 43114,
      accounts: AVALANCHE_PRIVATE_KEY ? [AVALANCHE_PRIVATE_KEY] : [],
    },
  },
  // Etherscan verification
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: SNOWTRACE_API_KEY,
      avalanche: SNOWTRACE_API_KEY,
    },
  },
  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "AVAX",
    showTimeSpent: true,
  },
  // Typechain configuration
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
  // Path configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  // Mocha configuration
  mocha: {
    timeout: 60000, // 60 seconds
  },
};

export default config;
