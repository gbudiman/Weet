const infura_key = '6647daa5d5b541958f75ef76dd670221'
const Web3 = require('web3')

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider)
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/' + infura_key))
}

const Tx = require('ethereumjs-tx')
const BigNumber = require('bignumber.js')
const fs = require('fs')
const abi = JSON.parse(fs.readFileSync('./abi/Weet.json'))
const contract_address = '0x530cad9642514d54380105aea6b71cdd2bf40c4b'
const contract = new web3.eth.Contract(abi, contract_address)


var get_total_weet = function() {
  contract.methods.weet_count().call().then(n => {
    console.log(n)
  })
}

var get_weet_by_id = function(id) {
  contract.methods.get_weet(id).call().then(a => {
    console.log(a)
  })
}

get_total_weet()
get_weet_by_id(1)