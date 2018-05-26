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
    this.pwd = pwd;
    this.blocks = [];
    this.difficulty = difficulty;
    this.pending = [];
    let keyObj = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
    this.publicKey = keyObj.pubKeyObj;
    this.privateKey = keyObj.prvKeyObj;
    this.masterHash = cjs.SHA256(pwd);
    this.db = new DB(this);

    this.txPool = undefined;

    // genesis block, give master loads of money
    // genesis transactions

  }

  setTxPool(txPool){
    this.txPool = txPool;
    this.masterWallet = new Wallet("admin",this,this.privateKey,this.publicKey,this.txPool);
    this.addToDatabase(this.masterWallet,this.pwd);

    let genesisOutput = new Output(this.masterWallet.publicKey,100000000);

    let genesisTransaction = new Transaction([],[genesisOutput.getOutput()],this.privateKey,this,this.publicKey);
    this.blocks.push(new Block([genesisTransaction.getTransactionString()],this.difficulty));
    console.log("Blockchain created, current length:",this.blocks.length);
  }


  // addBlock(data){
  //   this.blocks.push(new Block(data,this.difficulty,((this.blocks.length > 1) ? this.blocks[this.blocks.length-1].hash : undefined)));
  // }

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

  /*

    Transaction Tools

  */

  // Get up to 10 of transactions from tX pool
  // if tX pool has less than that, just make the block with whatever there is

  gatherTxs(){
    let tx = this.txPool.getTx();
    if (tx == false) {
      return
    }
    if (tx == undefined) {
      return
    }
    if ((tx != false) && (this.pending.length < 4)) {
      this.pending.push(tx.txData);
    } else if ((tx != false) && (this.pending.length >= 4)) {
      this.pending.push(tx.txData);
      this.addBlock(this.pending);
      this.pending = [];
    }
  }

  addBlock(data){
    // console.log("Length:",data.length);
    //console.log("Here is where it crashed");
    //console.log(data.length);
    //console.log(data);
    //console.log(JSON.parse(data[0]));
    // add up Tx fees and add them as a single output transaction
    let fees = data.map(tx => { JSON.parse(tx).inputs.map(input => { return input.value}).reduce((acc,cur) => { acc + cur},0) - JSON.parse(tx).outputs.map(output => { return output.value }).reduce((acc,cur) => { acc + cur}) });
    if (fees > 0){
      // let txFee = new Transaction(
      //   JSON.parse(JSON.stringify(["TxFee"])),
      //   JSON.parse(JSON.stringify([{
      //     "owner":jsrsa.KEYUTIL.getPEM(this.publicKey),
      //     "value":fees
      //   }])),
      //   this.privateKey,
      //   this,
      //   this.publicKey
      // );
      let output = new Output(jsrsa.KEYUTIL.getPEM(this.publicKey),fees)
      let txFee = new Transaction(
        ["TxFee"],
        [
          output.getOutput()
        ],
        this.privateKey,
        this,
        this.publicKey
      );
      data.push(txFee.getTransactionString());
    }

    // now add a new transaction for the new coins to be created with this block
    let output = new Output(jsrsa.KEYUTIL.getPEM(this.publicKey),10000)
    let newCoins = new Transaction(
      ["NewCoins"],
      [
        output.getOutput()
      ],
      this.privateKey,
      this,
      this.publicKey
    );
    data.push(newCoins.getTransactionString())
    //console.log("Data going into new block:");
    //console.log(data.length);
    this.blocks.push(new Block(data,this.difficulty,this.blocks[this.blocks.length-1].hash));
  }




  submitTransaction(transaction){
    if (!this.validateTransaction(transaction)) {
      console.log("Transaction Rejected, Invalid Signature : ");
      console.log(transaction.signature);
      return false;
    }
    if (!this.validateInputs(transaction)) {
      console.log("Transaction Rejected, Invalid Inputs : ");
      console.log(transaction.getTransactionString());
      return false;
    }
    console.log("Transaction Accepted : " + transaction.getTransactionID());
    this.pending.push(transaction.getTransactionString());
    return true;
  }

  checkTransaction(transaction){
    if (!this.validateSignature(transaction.signature,transaction.sender,transaction.hash)) {
      console.log("Transaction Rejected : Invalid Signature");
      return false;
    }
    if (!this.validateInputs(transaction.inputs)){
      console.log("Transaction Rejected : Invalid Inputs");
      return false;
    }
    if (transaction.inputs.map(txo => { return txo.value }).reduce((acc,cur) => { acc + cur },0) < transaction.outputs.map(txo => { return txo.value }).reduce((acc,cur) => { acc + cur },0)) {
      console.log("Transaction Rejected : Input sum less than Output sum");
      return false;
    }
    return true;
  }

  validateSignature(signature,sender,data){
    let sig = new jsrsa.crypto.Signature({'alg': 'SHA1withRSA'});
    sender = jsrsa.KEYUTIL.getKey(sender);
    sig.init(sender);
    sig.updateString(data);
    return sig.verify(signature);
  }

  validateTransaction(transaction){
    //console.log("validating transaction...");
    //console.log(transaction);
    let sig = new jsrsa.crypto.Signature({'alg':'SHA1withRSA'});
    let key = jsrsa.KEYUTIL.getKey(transaction.getSender())
    let data = transaction.getTransactionDataString();
    sig.init(key);
    sig.updateString(data);
    return sig.verify(transaction.signature);
  }


  validateInputs(inputs){
    return !inputs.map((txo) => { this.isOutputSpent(txo) }).includes(true);
  }

  isOutputSpent(givenOutput){
    // Does it even exist?
    if (givenOutput.value < 0) {
      return true;
    }
    if (this.blocks.length < 2) {
      return false;
    }
    var exists = false;
    //console.log("\nHere it keeps crashing...\n");
    for (let block of this.blocks.slice().reverse()) {
      //console.log(block.getData());
      for (let transaction of block.getData()) {
        //console.log(transaction);
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
    if (this.pending.length < 1) {
      if (exists) {
        return false;
      } else {
        return true;
      }
    }
    // for (let transaction of this.pending) {
    //   console.log("\n\nERROR!!\n");
    //   console.log(transaction);
    //   for (let input of transaction.inputs) {
    //     if (input == givenOutput){
    //       return true;
    //     }
    //   }
    // }
    if (exists) {
      return false;
    } else {
      return true;
    }
  }

  getOutputs(publicKey,amount){
    var outputs = this.getAllOutputs(publicKey);
    var txOutputs = [];
    var balance = 0;

    for (let output of outputs.slice().reverse()){
      balance = balance + output.value;
      txOutputs.push(output);
      if (balance >= amount) {
        return txOutputs;
      }
    }
    return false;
  }

  getAllOutputs(publicKey){
    let outputs = [];
    if (this.blocks.length < 1) {
      return 0;
    }
    for (let block of this.blocks) {
      for (let transaction of block.getData()) {
        outputs = outputs.filter(txo => {
          return !transaction.inputs.map(input => { return ((input.owner == txo.owner) && (input.value == txo.value) && (input.blockHash == txo.blockHash) && (input.transHash == txo.transHash)) }).includes(true);
        });
        for (let output of transaction.outputs) {
          if (output.owner == publicKey) {
            let newOutput = new Output(output.owner,output.value);
            newOutput.setHashes(block.hash,transaction.hash);
            outputs.push(newOutput.getInput());
          }
        }
      }
    }
    return outputs;
  }

  getBalance(publicKey){
    let outputs = [];
    if (this.blocks.length < 1) {
      return 0;
    }
    for (let block of this.blocks) {
      for (let transaction of block.getData()) {
        outputs = outputs.filter(txo => {
          return !transaction.inputs.map(input => { return ((input.owner == txo.owner) && (input.value == txo.value) && (input.blockHash == txo.blockHash) && (input.transHash == txo.transHash)) }).includes(true);
        });
        for (let output of transaction.outputs) {
          if (output.owner == publicKey) {
            let newOutput = new Output(output.owner,output.value);
            newOutput.setHashes(block.hash,transaction.hash);
            outputs.push(newOutput.getInput());
          }
        }
      }
    }
    if (outputs.length < 1) {
      return 0;
    }
    return outputs.reduce((acc,cur) => acc + cur.value,0);
  }

  update(){
    if (this.pending.length > 0) {
      //console.log("Emptying pending transactions");
      let transactions = this.pending.pop()
      this.addBlock([transactions]);
      //this.pending = [];
    }
  }

  checkTransactionJSON(data){
    // validate the transaction

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
    //console.log("\n\n\tWallets:");
    for (let wallet of wallets) {
      console.log(wallet.name,", Balance:",this.getBalance(wallet));
    }
  }


}
