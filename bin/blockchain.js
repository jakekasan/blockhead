const Block = require("./block.js");
const Transaction = require('./transaction');
const Wallet = require('./wallet.js');

module.exports = class BlockChain {
  constructor(difficulty,genesisBlock) {
    this.blocks = [];
    this.difficulty = difficulty;
    this.blocks.push(genesisBlock);
    this.pending = [];
  }

  submitTransaction(transaction){
    if (!this.validateSignature(transaction.signature,transaction.sender)) {
      console.log("Transaction Rejected, Invalid Signature : " + transaction.getDataString());
      return false;
    }
    if (!this.checkInputs(transaction.inputs,transaction.sender,transaction.amount)) {
      console.log("Transaction Rejected, Invalid Inputs : " + transaction.getDataString());
      return false;
    }
    console.log("Transaction Accepted : " + transaction.signature);
    this.pending.push(transaction.getData());
    return true;
  }

  addBlock(data){
    this.blocks.push(new Block(data,this.difficulty,((this.blocks.length > 1) ? this.blocks[this.blocks.length-1].hash : undefined)));
  }

  verifyBlockChain(){
    if (this.blocks.length < 2) {
      console.log("Blockchain too short to verify.");
      return true;
    }
    for (var i = this.blocks.length - 1; i > 1 ; i--) {
      if (this.blocks[i].prevHash != this.blocks[i-1].hash) {
        return false;
      }
    }
    return true;
  }

  validateSignature(signature,sender){
    if (!signature.includes(sender)) {
      return false
    }
    return true;
  }

  getInputs(name,balance){
    //console.log("Getting inputs for " + name);
    let potentialInputs = [];
    let tempBalance = 0;
    for (var i = this.blocks.length-1; i >= 0 ; i--) {
      for (var j = 0; j < this.blocks[i].data.length; j++) {
        let input = this.blocks[i].data[j];
        //console.log(input.data.to + " = " + name + " : ",input.data.to == name);
        if (input.data.to == name) {
          potentialInputs.push({
            "block":this.blocks[i].hash,
            "transaction":input.id,
          }input);
          tempBalance += input.data.amount;
        }
        if (tempBalance >= balance) {
          return potentialInputs;
        }
      }
    }
    return potentialInputs;
  }

  checkInputs(transactionInputs,sender,balance){
    let blockInputs = this.getInputs(sender,balance);
    return !transactionInputs.map((element) => {blockInputs.includes(element)}).includes(false);
  }

  update(){
    //console.log("Adding to BlockChain");
    //console.log(this.pending);
    if (this.pending.length > 0) {
      this.addBlock(this.pending);
    }
    this.pending = [];
  }

  print(){
    for (let i = 0; i < this.blocks.length; i++){
      this.blocks[i].print();
    }
  }


}
