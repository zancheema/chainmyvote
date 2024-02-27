const HDWalletProvider = require('@truffle/hdwallet-provider');
const mnemonic = 'various sound jacket oak region tent cable small early near canyon blouse';

module.exports = {
  contracts_build_directory: "./client/src/contracts",
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    polygon_mumbai: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        providerOrUrl: 'https://polygon-mumbai.g.alchemy.com/v2/ErYtXbHxS8Twjqp1OPxwsVz-vBnRqymv'
      }),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 20000000,
      skipDryRun: true,
      gas: 6000000,
      gasPrice: 10000000000,
      from : "0x264536e21cE74115827389c423a1f4E797B12707"
    },
    ethereum_sepolia: {
      provider: () => new HDWalletProvider({
        mnemonic: {
          phrase: mnemonic
        },
        providerOrUrl: 'https://eth-sepolia.g.alchemy.com/v2/aKcMcfkJMPnMbU36l6oBW0bFabbYToys'
      }),
      network_id: 11155111,
      confirmations: 2,
      timeoutBlocks: 20000000,
      skipDryRun: true,
      gas: 6000000,
      gasPrice: 10000000000,
      from : "0x264536e21cE74115827389c423a1f4E797B12707"
    }
  },

  compilers: {
    solc: {
      version: "0.8.19"
    }
  }
}