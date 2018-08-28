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


var yaml = require('js-yaml')
var fs = require('fs')
var l = yaml.safeLoad(fs.readFileSync('../../config/application.yml', 'utf8'))
var HDWalletProvider = require("truffle-hdwallet-provider");
var infura_apikey = l.infura_apikey
var mnemonic = l.hd_mnemonic

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
