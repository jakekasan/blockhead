const jsrsa = require("jsrsasign");
const cjs = require('crypto-js');
const Transaction = require('./transaction.js')

module.exports = class Wallet {
  constructor(name,blockchain,privateKey,publicKey) {
    this.blockchain = blockchain;
    this.balance = this.getBalance();
    this.name = name;
    this.publicKey = (typeof privateKey === "string" | privateKey instanceof String) ? publicKey : jsrsa.KEYUTIL.getPEM(publicKey);
    this.privateKey = (typeof privateKey === "string" | privateKey instanceof String) ? privateKey : jsrsa.KEYUTIL.getPEM(privateKey,"PKCS8PRV");
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
    let potentialInputs = [];
    for (var i = 0; i < blockchain.blocks.length; i++) {
      let blockData = blockchain.blocks[i].getData();
      for (var j = 0; j < blockData.length; j++) {
        let input = blockData[j];

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
    let inputs = this.blockchain.getInputs(this.publicKey,1000000000);
    return inputs.map((element) => { element.amount }).reduce((acc,element) => { acc + element } ,0);
  }

}
