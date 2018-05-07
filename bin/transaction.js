const cjs = require('crypto-js');

module.exports = class Transaction {
  constructor(from,to,amount,inputs,prvKey) {
    this.data = {
      "from": this.sender,
      "to": this.recipient,
      "amount": this.amount,
      "inputs": this.inputs
    };
    this.id = cjs.SHA256(JSON.stringify(this.data));
    this.signature = signTransaction(prvKey);
    delete prvKey;
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
    let sig = new jsrsa.crypto.Signature({"alg": "SHA1withRSA"});
    sig.init(prvKey);
    sig.updateString(this.data);
    return sig.sign().toString("hex");
  }

  getDataString(){
    return JSON.stringify(this.getData());
  }
}
