const Block = require("./block.js");
const Transaction = require('./transaction');

module.exports = class BlockChain {
  constructor(difficulty,genesisBlock) {
    this.blocks = [];
    this.difficulty = difficulty;
    this.blocks.push(genesisBlock);
  }

  submitTransaction(transaction){
    let wallet = new Wallet(transaction.sender,this);
    if (transaction.inputs != wallet.getInputs(this)) {
      return false;
    }
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

  print(){
    for (let i = 0; i < this.blocks.length; i++){
      this.blocks[i].print();
    }
  }


}
