const Block = require("./block.js");
const Transaction = require('./transaction');
const Wallet = require('./wallet.js');
const UserData = require('./../models/userDataModel.js');
const DB = require('./../models/database.js');
const jsrsa = require('jsrsasign');
const cjs = require('crypto-js');

var potential_names = ["Adam","Ben","Chandler","Daryl","Ephelia","Francine","George","Henrietta","Isobel","Janice","Dwight","Joey","Ross","Rachel","Pheobe","Pam"];
var potential_surnames = ["Geller","Smith","Davis","Hannah","Carrola","Buffay","Halpert","Schrute","Bing","Tribiani","Greene","Bluth"];

module.exports = class BlockChain {
  constructor(difficulty,pwd="boobs",firstRecipients) {
    this.blocks = [];
    this.difficulty = difficulty;
    this.pending = [];
    let keyObj = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
    this.publicKey = keyObj.pubKeyObj;
    this.privateKey = keyObj.prvKeyObj;
    this.masterHash = cjs.SHA256(pwd);

    keyObj = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
    let genesisPub = keyObj.pubKeyObj;
    let genesisPrv = keyObj.prvKeyObj;

    // make God's wallet...
    console.log("Making God Wallet...");
    let masterWallet = new Wallet("God",this,this.privateKey,this.publicKey);
    let genesisWallet = new Wallet("God",this,genesisPrv,genesisPub);
    console.log("Wallet made...");
    this.db = new DB();
    //console.log("Adding to database...");
    this.db.addData(masterWallet,pwd);
    this.db.addData(genesisWallet,pwd);
    //console.log("Data added to database");


    // genesisBlock - give a few million to admin
    console.log("New Transaction");
    let bigBang = new Transaction(genesisPub,this.publicKey,1000000000,[],genesisPrv);
    //console.log("Validating signature manually...");
    //console.log(bigBang.signature);
    //console.log(this.validateSignature(bigBang.signature,bigBang.sender,bigBang.getDataString()));
    //console.log("Transaction created...");
    this.blocks.push(new Block([bigBang],this.difficulty));
    console.log("GENESIS BLOCK PUSHED!");
    for (var i = 0; i < 1; i++) {
      let firstName = potential_names[Math.floor(Math.random()*potential_names.length)];
      let LastName = potential_surnames[Math.floor(Math.random()*potential_surnames.length)];
      let name = firstName + " " + LastName;
      let keyObj = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
      console.log("BLOCKCHAIN - making new wallet for " + name);
      let wallet = new Wallet(name,this,keyObj.prvKeyObj,keyObj.pubKeyObj);
      this.db.addData(wallet,LastName);
      let value = 10*Math.random();
      if (!this.submitTransaction(new Transaction(this.publicKey,wallet.publicKey,value,this.getInputs(this.publicKey,value),this.privateKey))){
        console.log("Transaction failed");
      };
      this.update();
    }
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
    let sig = new jsrsa.crypto.Signature({'alg': 'SHA1withRSA'});
    sender = jsrsa.KEYUTIL.getKey(sender);
    sig.init(sender);
    sig.updateString(data);
    return sig.verify(signature);
  }

  validateTransaction(transaction){
    console.log("validating transaction..");
    let sig = new jsrsa.crypto.Signature({'alg':'SHA1withRSA'});
    let key = jsrsa.KEYUTIL.getKey(transaction.sender)
    let data = transaction.getDataString();
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
          console.log("Hash: " + this.blocks[i].hash + "\tInput: " + input.id);
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

  getBalance(publicKey,upTo){
    let inputs = [];
    if (!upTo) {
      upTo = 10000000000;
    }
    for (let i = 0; i < this.blocks.length; i++) {
      let blockData = this.blocks[i].data;
      for (let j = 0; j < blockData.length; j++) {
        let transaction = blockData[j];
        if (transaction.sender == publicKey) {
          inputs.push({
            "amount": -transaction.amount
          });
        }
        if (transaction.recipient == publicKey) {
          inputs.push({
            "amount": transaction.amount
          });
        }
      }
    }
    return inputs;
  }

  getInputs(publicKey,upTo){
    let inputs = [];
    if (!upTo) {
      upTo = 10000000000;
    }
    for (let i = 0; i < this.blocks.length; i++) {
      let blockData = this.blocks[i].data;
      for (let j = 0; j < blockData.length; j++) {
        let transaction = blockData[j];
        if (transaction.sender == publicKey) {
          inputs.push({
            "amount": -transaction.amount
          });
        }
        if (transaction.recipient == publicKey) {
          inputs.push({
            "amount": transaction.amount
          });
        }
        if (upTo <= 0){
          return inputs;
        }
      }
    }
    return inputs;
  }

  checkInputs(transaction){
    console.log("Checking transaction");
    let transactionInputs = transaction.inputs;//this.getInputsFromTransaction(transaction);
    if (!transactionInputs) {
      return false;
    }
    console.log("Got inputs from transaction");
    //transactionInputs = JSON.parse(transactionInputs);
    let blockInputs = this.getInputs(transaction.sender,transaction.amounts);
    if (!blockInputs){
      return false;
    };

    return !(transactionInputs.map((element) => {blockInputs.includes(element)}).includes(false));
  }

  getByName(name){
    for (var i = 0; i < this.blocks.length; i++) {
      for (var j = 0; j < this.blocks[i].data.length; j++) {
        this.blocks.data[i];
      }
    }
  }

  update(){
    if (this.pending.length >= 4) {
      console.log("Emptying pending transactions");
      this.addBlock(this.pending);
      this.pending = [];
    }
  }

  print(){
    for (let i = 0; i < this.blocks.length; i++){
      this.blocks[i].print();
    }
  }


}
