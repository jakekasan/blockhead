const cjs = require('crypto-js');
const jsrsa = require('jsrsasign');

module.exports = class Transaction {
  constructor(inputs,outputs,prvKey,blockchain){
    this.inputs = inputs;
    this.outputs = outputs;
    this.hash = this.getHash();
    this.signature = this.signTransaction(prvKey);
    this.blockchain = blockchain;
  }

  getTransactionString(){
    let data = {
      "inputs":this.inputs,
      "outputs":this.outputs,
      "hash":this.hash,
      "signature":this.signature
    };
    return JSON.stringify(data);
  }

  getTransactionID(){
    return this.signature;
  }

  getTransactionDataString(){
    let data = {
      "inputs":this.inputs,
      "outputs":this.outputs
    };
    return JSON.stringify(data);
  }

  getSender(){
    return this.inputs[0].owner;
  }

  getHash(){
    return cjs.SHA256(this.getTransactionDataString()).toString();
  }

  signTransaction(prvKey){
    let sig = new jsrsa.crypto.Signature({'alg': 'SHA1withRSA'});
    sig.init(jsrsa.KEYUTIL.getKey(prvKey));
    sig.updateString(this.getTransactionDataString());
    let signature = sig.sign();
    return signature.toString();
  }
}

//
// // ALTERNATIVE TRANSACTION
//
// class Transaction {
//   constructor(from,to,amount,inputs,prvKey) {
//     this.sender = (typeof from === 'string' || from instanceof String) ? from : jsrsa.KEYUTIL.getPEM(from);
//     this.recipient = (typeof to === 'string' || to instanceof String) ? to : jsrsa.KEYUTIL.getPEM(to);
//     this.amount = amount;
//     this.inputs = inputs;
//     this.data = {
//       "from": this.sender,
//       "to": this.recipient,
//       "amount": this.amount,
//       "inputs": this.inputs,
//       "outputs":
//     };
//     this.id = cjs.SHA256(JSON.stringify(this.data)).toString(cjs.enc.Hex);
//     prvKey = (typeof prvKey === 'string' || prvKey instanceof String) ? prvKey : jsrsa.KEYUTIL.getPEM(prvKey,"PKCS8PRV");
//     this.signature = this.signTransaction(prvKey);
//   }
//
//   getTransactionString(){
//     if (!this.signature) {
//       return undefined;
//     }
//     let transaction = {
//       "id": this.id,
//       "data": this.data,
//       "signature":this.signature,
//     };
//     return JSON.stringify(transaction,null,2);
//   }
//
//   getTransactionID(){
//     return this.id;
//   }
//
//   signTransaction(prvKey){
//     let sig = new jsrsa.crypto.Signature({'alg': 'SHA1withRSA'});
//     sig.init(jsrsa.KEYUTIL.getKey(prvKey));
//     sig.updateString(this.getDataString());
//     let signature = sig.sign();
//     return signature.toString();
//   }
//
//   getDataString(){
//     return JSON.stringify(this.data,null,2);
//   }
// }
