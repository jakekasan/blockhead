const jsrsa = require("jsrsasign");
const cjs = require('crypto-js');
const Transaction = require('./transaction.js')

module.exports = class Wallet {
  constructor(name,blockchain) {
    this.blockchain = blockchain;
    this.balance = getInputs(blockchain);
    this.name = name;
    this.publicKey = cjs.MD5(name).toString();
    this.privateKey = cjs.MD5(name).toString();
  }

  sendMoney(amount,recipient){
    if (amount < this.balance) {
      return false;
    }
    let transaction = new Transaction(this.name,recipient,amount,getInputs(this.blockchain),signTransaction(amount,recipient));
    if (!this.blockchain.submitTransaction(transaction)){
      return false;
    }
    return true;
  }

  signTransaction(amount,recipient){
    let signature = this.name + " sends " + amount.toString() + " to " + recipient;
    return signature;
  }

  getInputs(blockchain){
    let potentialInputs = [];
    for (var i = 0; i < blockchain.blocks.length; i++) {
      for (var j = 0; j < blockchain.blocks[i].data.length; j++) {
        let input = blockchain.blocks[i].data[j];
        if (input.to == this.publicKey) {
          potentialInputs.push(input);
        }
      }
    }

    return potentialInputs;
  }

}
