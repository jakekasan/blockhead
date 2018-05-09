const cjs = require('crypto-js');
const jsrsa = require('jsrsasign');

module.exports = class Transaction {
  constructor(from,to,amount,inputs,prvKey) {
    this.sender = (typeof from === 'string' || from instanceof String) ? from : jsrsa.KEYUTIL.getPEM(from);
    this.recipient = (typeof to === 'string' || to instanceof String) ? to : jsrsa.KEYUTIL.getPEM(to);;
    this.amount = amount;
    this.inputs = inputs;
    this.data = {
      "from": this.sender,
      "to": this.recipient,
      "amount": this.amount,
      "inputs": this.inputs
    };
    this.id = cjs.SHA256(JSON.stringify(this.data));
    this.signature = this.signTransaction(prvKey);
  }

  getData(){
    if (!this.signature) {
      return undefined;
    }
    let transaction = {
      "id": this.id,
      "data": this.data,
      "signature":this.signature,
    };
    return transaction;
  }

  signTransaction(prvKey){
    let sig = new jsrsa.crypto.Signature({'alg': 'SHA1withRSA'});
    sig.init(prvKey);
    sig.updateString(JSON.stringify(this.data));
    return sig.sign(); //.toString("hex");
  }

  getDataString(){
    return JSON.stringify(this.getData());
  }
}
