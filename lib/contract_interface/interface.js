var yaml = require('js-yaml')
var fs = require('fs')

var l = yaml.safeLoad(fs.readFileSync('../../config/application.yml', 'utf8'))
var argv = process.argv
var command = argv[2]
var infura_key = l.infura_key
const Web3 = require('web3')
const keyword = ' SYNC COMPLETED!'

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider)
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/' + infura_key))
}

const Tx = require('ethereumjs-tx')
const BigNumber = require('bignumber.js')
const abi = JSON.parse(fs.readFileSync('./abi/Weet.json'))
var contract_address = l.contract_address
var contract = new web3.eth.Contract(abi, contract_address)

var get_transaction_count = function(address) {
  return new Promise((resolve, reject) => {
    web3.eth.getTransactionCount(address).then(n => {
      resolve(n)
    })
  })
}

var compose_transaction = function(h) {
  return new Promise((resolve, reject) => {
    get_transaction_count(h.from).then(nonce => {
      let tx = new Tx({
        nonce: nonce,
        from: h.from,
        to: h.to,
        gasPrice: 1e11,
        gasLimit: 4.7e6,
        data: h.data,
      })

      let pk_buffer = Buffer.from(h.pk, 'hex')
      tx.sign(pk_buffer)
      web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex'))
        .on('transactionHash', hash => { console.log('Tx Hash: ' + hash) })
        .on('receipt', receipt => {
          resolve(receipt)
        }).catch(error => { reject(error) })
    }).catch(error => { reject(error) })
  })
}

var upload_weet = function(weet_id, weeter_id, timestamp, content, address, private_key) {
  return new Promise((resolve, reject) => {
    let method = contract.methods.upload_weet(weet_id, weeter_id, timestamp, content).encodeABI()

    compose_transaction({
      from: address,
      to: contract_address,
      data: method,
      pk: private_key
    }).then(receipt => {
      resolve(receipt)
    })
  })
}

var publish_weet = function(weet_id, weeter_id, timestamp, content, address, private_key, val) {
  return new Promise((resolve, reject) => {
    let method = contract.methods.publish_weet(weet_id, weeter_id, timestamp, content, val).encodeABI()

    compose_transaction({
      from: address,
      to: contract_address,
      data: method,
      pk: private_key
    }).then(receipt => {
      resolve(receipt)
    })
  })
}

var test = function() {

}

let marker = command + ' ' + argv[3] + keyword
switch (command) {
  case 'test':
    test()
    console.log(infura_key)
    console.log(contract_address)
    break
  case 'upload':
    upload_weet(parseInt(argv[3]), 
                parseInt(argv[4]), 
                parseInt(argv[5]), 
                argv[6], argv[7], argv[8]).then(x => { 
                  console.log(x) 
                  console.log(marker) 
                })
    break
  case 'publish':
    publish_weet(parseInt(argv[3]),
                 parseInt(argv[4]),
                 parseInt(argv[5]),
                 argv[6], argv[7], argv[8], true).then(x => { 
                  console.log(x)
                  console.log(marker) 
                })
    break
  case 'rejex':
    publish_weet(parseInt(argv[3]),
                 parseInt(argv[4]),
                 parseInt(argv[5]),
                 argv[6], argv[7], argv[8], false).then(x => { 
                  console.log(x)
                  console.log(marker) 
                })
    break
}