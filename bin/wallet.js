const jsrsa = require("jsrsasign");
const cjs = require('crypto-js');
const Transaction = require('./transaction.js')

module.exports = class Wallet {
  constructor(name,blockchain,privateKey,publicKey) {
    this.blockchain = blockchain;
    this.balance = this.getBalance();
    this.name = name;
    this.publicKey = publicKey;
    this.privateKey = privateKey
    // let keyObj = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
    // this.publicKey = keyObj.pubKeyObj;
    // this.privateKey = keyObj.prvKeyObj;
  }

  sendMoney(amount,recipient){
    if (recipient == this.publicKey | recipient == undefined) {
      return false;
    }
    if (amount < this.balance) {
      return false;
    }
    let transaction = new Transaction(this.publicKey,recipient,amount,this.blockchain.getInputs(this.name),this.privateKey);
    if (!this.blockchain.submitTransaction(transaction)){
      return false;
    }
    return true;
  }

  signTransaction(amount,recipient){
    let sig = jsrsa.crypto.Signature({"alg":"SHA1withRSA"});

    let signature = this.name + " sends " + amount.toString() + " to " + recipient;
    return signature;
  }

  verifySignature(publicKey,message,signature){
    //let sig = jsrsa.crypto.Signature({"alg":"SHA1withRSA"});
    //sig.init(publicKey);
    //sig.update(message);
    //return sig.verify(signature);
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
