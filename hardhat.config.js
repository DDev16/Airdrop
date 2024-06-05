require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ethers');
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();
require('hardhat-contract-sizer'); // Include the contract sizer plugin

const { PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.25",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000,
          },
          viaIR: true, // Enable Intermediate Representation optimization
        },
      },
      {
        version: "0.8.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 5000,
          },
          viaIR: true, // Enable Intermediate Representation optimization
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
  },
  sourcify: {
    enabled: true, // Enable Sourcify verification
  },
  etherscan: {
    apiKey: {
      flare: "dummy-key",
      songbird: "dummy-key",
      coston: "dummy-key",
    },
    customChains: [
      {
        network: "flare",
        chainId: 14,
        urls: {
          apiURL: "https://flare-explorer.flare.network/api",
          browserURL: "https://flare-explorer.flare.network",
        },
      },
      {
        network: "songbird",
        chainId: 19,
        urls: {
          apiURL: "https://songbird-explorer.flare.network/api",
          browserURL: "https://songbird-explorer.flare.network",
        },
      },
      {
        network: "coston",
        chainId: 16,
        urls: {
          apiURL: "https://coston-explorer.flare.network/api",
          browserURL: "https://coston-explorer.flare.network",
        },
      },
    ],
  },
  networks: {
    localhost: {
      chainId: 31337,
      accounts: [`0x${PRIVATE_KEY}`], // Account 0 private key
      blockGasLimit: 30000000, // Increase block gas limit
    },
    flare: {
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      url: "https://rpc.ankr.com/flare",
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 14,
      blockGasLimit: 30000000, // Increase block gas limit
    },
    songbird: {
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      url: "https://songbird-api.flare.network/ext/bc/C/rpc",
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 19,
      blockGasLimit: 30000000, // Increase block gas limit
    },
    coston: {
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      url: "https://coston-api.flare.network/ext/C/rpc",
      accounts: [`0x${PRIVATE_KEY}`],
      chainId: 16,
      blockGasLimit: 30000000, // Increase block gas limit
    },
    mumbai: {
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      url: "https://polygon-mumbai-bor-rpc.publicnode.com",
      chainId: 80001,
      accounts: [`0x${PRIVATE_KEY}`],
      blockGasLimit: 30000000, // Increase block gas limit
    },
    polygon: {
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      url: "https://polygon-rpc.com",
      chainId: 137,
      accounts: [`0x${PRIVATE_KEY}`],
      blockGasLimit: 30000000, // Increase block gas limit
    },
    goerli: {
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 1,
      url: "https://ethereum-goerli.publicnode.com",
      chainId: 5,
      accounts: [`0x${PRIVATE_KEY}`],
      blockGasLimit: 30000000, // Increase block gas limit
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
    disambiguatePaths: false,
  },
};
