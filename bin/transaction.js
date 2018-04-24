class Transaction {
  constructor(from,to,amount,inputs) {
    this.sender = from;
    this.recipient = to;
    this.amount = amount;
    this.inputs = inputs;
    this.outputs = [];
  }

  
}
