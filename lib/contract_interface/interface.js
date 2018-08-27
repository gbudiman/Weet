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
const contract_address = '0x1eb07656f07ff5a8d9b83350d39080213ae866fd'
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

// const test_address = '0x498e1A1Cd0fB46d82E77836EF4AB973d36Bef799'
// upload_weet(11, 141, 5135413, 'You like my corruption?', test_address, test_pk).then(receipt => {
//   console.log(receipt)
// })