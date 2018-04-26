class Transaction {
  constructor(from,to,amount,inputs,signature) {
    this.sender = from;
    this.recipient = to;
    this.amount = amount;
    this.inputs = inputs;
    this.signature = signature;
  }

  getData(){
    let transaction = {
      "data":{
        "from": this.sender,
        "to": this.recipient,
        "amount": this.amount,
        "inputs": this.inputs
      },
      "signature":this.signature,
    };
    return JSON.stringify(transaction);
  }

}
