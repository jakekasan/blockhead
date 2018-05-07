const jsrsa = require("jsrsasign");
const cjs = require('crypto-js');
const Transaction = require('./transaction.js')

module.exports = class Wallet {
  constructor(name,blockchain,privateKey=undefined,publicKey=undefined) {
    this.blockchain = blockchain;
    this.balance = this.getBalance();
    this.name = name;
    keyObj = (privateKey) ? jsrsa.KEYUTIL.generateKeypair("RSA",1024) : undefined;
    this.publicKey = (privateKey) ? publicKey : keyObj.pubKeyObj;
    this.privateKey = (privateKey) ? privateKey : keyObj.prvKeyObj;
  }

  sendMoney(amount,recipient){
    if (recipient == this.name | recipient == undefined) {
      return false;
    }
    if (amount < this.balance) {
      return false;
    }
    let transaction = new Transaction(this.name,recipient,amount,this.blockchain.getInputs(this.name),this.signTransaction(amount,recipient));
    if (!this.blockchain.submitTransaction(transaction)){
      return false;
    }
    return true;
  }

  signTransaction(amount,recipient){
    let signature = this.name + " sends " + amount.toString() + " to " + recipient;
    return signature;
  }

  verifySignature(publicKey,message,signature){
    let sig = jsrsa.crypto.Signature({"alg":"SHA1withRSA"});
    sig.init(publicKey);
    sig.update(message);
    return sig.verify(signature);
  }

  getInputs(blockchain){
    //console.log("Getting inputs for " + this.name);
    let potentialInputs = [];
    for (var i = 0; i < blockchain.blocks.length; i++) {
      for (var j = 0; j < blockchain.blocks[i].data.length; j++) {
        let input = blockchain.blocks[i].data[j];
        if (input.data.to == this.name) {
          let block = blockchain.blocks[i].hash;
          let transaction = input.id;
          potentialInputs.push({
            "block":block,
            "transaction":transaction
          });
        }
      }
    }
    return potentialInputs;
  }

  getBalance(){
    let inputs = this.getInputs(this.blockchain,1000000000);
    return inputs.map((element) => { element.amount }).reduce((acc,element) => { acc + element } ,0);
  }

}
