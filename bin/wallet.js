const jsrsa = require("jsrsasign");
const cjs = require('crypto-js');
const Transaction = require('./transaction.js');
const Output = require('./output.js');

module.exports = class Wallet {
  constructor(name,blockchain,privateKey,publicKey) {
    this.blockchain = blockchain;
    this.balance = this.getBalance();
    this.name = name;
    this.publicKey = (typeof privateKey === "string" | privateKey instanceof String) ? publicKey : jsrsa.KEYUTIL.getPEM(publicKey);
    this.privateKey = (typeof privateKey === "string" | privateKey instanceof String) ? privateKey : jsrsa.KEYUTIL.getPEM(privateKey,"PKCS8PRV");
  }

  sendMoney(amount,recipient){
    // get recipient's publicKey and valid outputs

    if (recipient == this.publicKey) {
      return false;
    }

    let inputs = this.blockchain.getOutputs(this.publicKey,amount);
    if (inputs.length < 1 | inputs == false) {
      return false;
    }
    let inputValue = inputs.map((x)=>{return x.value}).reduce((acc,cur) => cur + acc,0);
    let leftover = inputValue - amount;
    console.log("inputValue:",inputValue,"  leftover = ",leftover);
    let outputs = [
      (new Output(recipient,amount)).getOutput(),
      (new Output(this.publicKey,leftover)).getOutput()
    ];

    console.log("Submitting transaction");
    let transaction = new Transaction(inputs,outputs,this.privateKey,this.blockchain,this.publicKey);
    if (!this.blockchain.submitTransaction(transaction)){
      return false;
    }
    return true;
  }


  getBalance(){
    return this.blockchain.getBalance(this.publicKey);
  }

  getPublicKey(){
    return this.publicKey;
  }

}
