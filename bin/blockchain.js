const Block = require("./block.js");
const Transaction = require('./transaction');
const Wallet = require('./wallet.js');
const UserData = require('./../models/userDataModel.js');
const Output = require('./output.js');
const DB = require('./../models/database.js');
const jsrsa = require('jsrsasign');
const cjs = require('crypto-js');

module.exports = class BlockChain {
  constructor(difficulty,pwd="boobs",firstRecipients) {
    this.blocks = [];
    this.difficulty = difficulty;
    this.pending = [];
    let keyObj = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
    this.publicKey = keyObj.pubKeyObj;
    this.privateKey = keyObj.prvKeyObj;
    this.masterHash = cjs.SHA256(pwd);
    this.db = new DB(this);
    this.masterWallet = new Wallet("admin",this,this.privateKey,this.publicKey);
    this.addToDatabase(this.masterWallet,pwd);

    // genesis block, give master loads of money
    // genesis transactions
    let genesisOutput = new Output(this.masterWallet.publicKey,100000000);

    let genesisTransaction = new Transaction([],[genesisOutput.getOutput()],this.privateKey,this);
    this.blocks.push(new Block([genesisTransaction.getTransactionString()],this.difficulty));
    console.log("Blockchain created, current length:",this.blocks.length);
  }



  submitTransaction(transaction){
    if (!this.validateTransaction(transaction)) {
      console.log("Transaction Rejected, Invalid Signature : ");
      console.log(transaction.getTransactionString());
      return false;
    }
    if (!this.checkInputs(transaction)) {
      console.log("Transaction Rejected, Invalid Inputs : ");
      console.log(transaction.getTransactionString());
      return false;
    }
    console.log("Transaction Accepted : " + transaction.getTransactionID());
    this.pending.push(transaction.getTransactionString());
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

  validateSignature(signature,sender,data){
    console.log("validating signature...");
    let sig = new jsrsa.crypto.Signature({'alg': 'SHA1withRSA'});
    sender = jsrsa.KEYUTIL.getKey(sender);
    sig.init(sender);
    sig.updateString(data);
    return sig.verify(signature);
  }

  validateTransaction(transaction){
    console.log("validating transaction...");
    //console.log(transaction);
    let sig = new jsrsa.crypto.Signature({'alg':'SHA1withRSA'});
    let key = jsrsa.KEYUTIL.getKey(transaction.getSender())
    let data = transaction.getTransactionDataString();
    sig.init(key);
    sig.updateString(data);
    return sig.verify(transaction.signature);
  }

  getInputsFromTransaction(transaction){
    //let name = (typeof name === "string" || name instanceof String) ? name : jsrsa.KEYUTIL.getPEM(name);
    let name = transaction.sender;
    let potentialInputs = [];
    let tempBalance = 0;
    for (var i = this.blocks.length-1; i >= 0 ; i--) {
      let blockData = JSON.parse(this.blocks[i].data);
      for (var j = 0; j < blockData.length; j++) {
        let input = (blockData[j]);
        if (input.data.to == name) {
          //console.log("Hash: " + this.blocks[i].hash + "\tInput: " + input.id);
          potentialInputs.push({
            "block":JSON.parse(this.blocks[i]).hash,
            "transaction":input.id,
          });
          //console.log(JSON.stringify(input,null,2));
          tempBalance += input.data.amount;
        }
        if (tempBalance >= balance) {
          return potentialInputs;
        }
      }
    }
    if (tempBalance < balance) {
      return false;
    }
    return potentialInputs;
  }

  checkInputs(transaction){
    return !transaction.inputs.map((txo) => { this.isOutputSpent(txo) }).includes(true);
  }

  isOutputSpent(givenOutput){
    // Does it even exist?
    if (this.blocks.length < 2) {
      return false;
    }
    var exists = false;
    for (let block of this.blocks.slice().reverse()) {
      for (let transaction of block.getData()) {
        for (let input of transaction.inputs) {
          if (input == givenOutput) {
            return true;
          }
        }
        for (let output of transaction.outputs) {
          if (output == givenOutput) {
            exists = true;
          }
        }
      }
    }

    for (let block of this.pending) {
      for (let transaction of block.getData()) {
        for (let input of transaction.inputs) {
          if (input == givenOutput){
            return true;
          }
        }
      }
    }
    if (exists) {
      return false;
    } else {
      return true;
    }

    //
    // for (var i = this.blocks.length - 1; i >= 0; i--) {
    //   let block = this.blocks[i].getObject();
    //   for (let j = 0; j < block.data.length; j++) {
    //     let transaction = JSON.parse(block.data[j]);
    //     for (let k = 0; k < transaction.inputs.length; k++){
    //       if (transaction.inputs[k] == output) {
    //         // output has been used
    //         return true;
    //       }
    //     }
    //     for (let k = 0; k < transaction.outputs.length; k++){
    //       if (transaction.outputs[k] == output) {
    //         // found the output
    //         exists = true;
    //       }
    //     }
    //   }
    //   if (exists) {
    //     return false;
    //   }
    // }
  }

  getOutputs(publicKey,amount){
    //console.log("Getting outputs");
    var outputs = [];
    var balance = 0;

    // check through pending transactions - NOT anymore... getting inputs from pending transactions is a bad idea...

    // for (let transaction of this.pending.slice().reverse()) {
    //   transaction = JSON.parse(transaction);
    //   outputs = outputs.filter((txo) => { !transaction.inputs.includes(txo) });
    //   if (outputs.length > 0) {
    //     balance = outputs.map((txo) => { txo.value }).reduce((acc,el) => (el + acc));
    //   }
    //   //console.log(transaction);
    //   for (let output of transaction.outputs) {
    //     if (output.owner == publicKey) {
    //       let newOutput = new Output(output.owner,output.value);
    //       balance += output.value;
    //       newOutput.setHashes("",transaction.hash);
    //       outputs.push(newOutput.getInput());
    //     }
    //     if (balance >= amount) {
    //       return outputs;
    //     }
    //   }
    // }

    // now check written blocks

    for (let block of this.blocks.slice().reverse()) {
      for (let transaction of block.getData().slice().reverse()) {
        outputs = outputs.filter((txo) => { !transaction.inputs.includes(txo) });
        if (outputs.length > 0) {
          balance = outputs.map((txo) => { txo.value }).reduce((acc,el) => (el + acc));
        }
        for (let output of transaction.outputs) {
          if (output.owner == publicKey) {
            let newOutput = new Output(output.owner,output.value);
            balance += output.value;
            newOutput.setHashes(block.hash,transaction.hash);
            outputs.push(newOutput.getInput());
          }
          if (balance >= amount) {
            return outputs;
          }
        }
      }
    }

    return false;
  }

  getBalance(publicKey){
    //console.log("Getting balance");
    let outputs = [];
    if (this.blocks.length < 1) {
      //console.log("Blocks are too short");
      return 0;
    }
    for (let block of this.blocks) {

      for (let transaction of block.getData()) {

        outputs = outputs.filter(txo => {
          return !transaction.inputs.map(input => { return ((input.owner == txo.owner) && (input.value == txo.value) && (input.blockHash == txo.blockHash) && (input.transHash == txo.transHash)) }).includes(true);
        });
        //console.log(transaction.outputs);
        for (let output of transaction.outputs) {

          if (output.owner == publicKey) {
            console.log("getBalance - found a relevant output! Value:",output.value);
            let newOutput = new Output(output.owner,output.value);
            newOutput.setHashes(block.hash,transaction.hash);
            outputs.push(newOutput.getInput());
          }
        }
      }
    }

    if (outputs.length < 1) {
      //console.log("No outputs found for",publicKey);
      return 0;
    }
    //console.log("Outputs:");
    //console.log(outputs);
    let balance = outputs.reduce((acc,cur) => acc + cur.value,0);
    //console.log("Key: ",publicKey);
    //console.log("Balance:",balance);
    return balance;
  }

  update(){
    if (this.pending.length > 0) {
      console.log("Emptying pending transactions");
      let transactions = this.pending.pop()
      this.addBlock([transactions]);
      //this.pending = [];
    }
  }

  print(){
    for (let i = 0; i < this.blocks.length; i++){
      this.blocks[i].print();
    }
  }

  getString(){
    toPrint = [];
    for (block of this.blocks) {
      toPrint.push(block.getDataString());
    }
    return JSON.stringify(toPrint);
  }

  addToDatabase(wallet,password){
    this.db.addData(wallet,password);
  }

  getRandomPublicKey(){
    return this.db.getRandomPublicKey();
  }

  //debugging

  findWallets(){
    let wallets = [];
    for (let block of this.blocks) {
      for (let transaction of block.getData()) {
        //transaction = JSON.parse(transaction);
        for (let output of transaction.outputs) {
          if (!wallets.includes(output.owner)) {
            wallets.push(output.owner);
          }
        }
      }
    }
    console.log("\n\n\tWallets:");
    for (let wallet of wallets) {
      console.log(wallet,"Balance:",this.getBalance(wallet));
    }
  }


}
