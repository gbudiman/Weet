/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

var HDWalletProvider = require("truffle-hdwallet-provider");
var infura_apikey = '6647daa5d5b541958f75ef76dd670221'
var mnemonic = 'story harsh opinion genre street mercy current gown amazing piano trade flight'

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/' + infura_apikey)
      },
      network_id: 1,
      gas: 4700000,
      gasPrice: 17e9,
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/' + infura_apikey)
      },
      network_id: 2,
    },
    development: {
      host: 'localhost',
      port: 7545,
      network_id: 0
    }
  }
};
