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
    //console.log("Making God Wallet...");
    let masterWallet = new Wallet("God",this,this.privateKey,this.publicKey);
    let genesisWallet = new Wallet("God",this,genesisPrv,genesisPub);
    //console.log("Wallet made...");
    this.db = new DB();
    //console.log("Adding to database...");
    this.db.addData(masterWallet,pwd);
    this.db.addData(genesisWallet,pwd);
    //console.log("Data added to database");


    // genesisBlock - give a few million to admin
    let bigBang = new Transaction(genesisPub,this.publicKey,1000000000,[],genesisPrv);
    console.log("Validating signature manually...");
    console.log(bigBang.signature);
    console.log(this.validateSignature(bigBang.signature,bigBang.sender,bigBang.getDataString()));
    //console.log("Transaction created...");
    this.blocks.push(new Block([bigBang],this.difficulty));
    //console.log("GENESIS BLOCK PUSHED!");
    for (var i = 0; i < 1; i++) {
      let firstName = potential_names[Math.floor(Math.random()*potential_names.length)];
      let LastName = potential_surnames[Math.floor(Math.random()*potential_surnames.length)];
      let name = firstName + " " + LastName;
      let keyObj = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
      console.log("BLOCKCHAIN - making new wallet");
      let wallet = new Wallet(name,this,keyObj.prvKeyObj,keyObj.pubKeyObj);
      console.log("BLOCKCHAIN - made new wallet");
      this.db.addData(wallet,LastName);
      let value = 10*Math.random();
      this.submitTransaction(new Transaction(this.publicKey,wallet.publicKey,value,this.getInputs(this.publicKey,value),keyObj.prvKeyObj));
      this.update();
    }
  }



  submitTransaction(transaction){
    if (!this.validateTransaction(transaction)) {
      console.log("Transaction Rejected, Invalid Signature : ");
      console.log(transaction.getTransactionString());
      return false;
    }
    if (!this.checkInputs(transaction.inputs,transaction.sender,transaction.amount)) {
      console.log("Transaction Rejected, Invalid Inputs : ");
      console.log(transaction.getTransactionString());
      return false;
    }
    console.log("Transaction Accepted : " + transaction.signature);
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
    let sig = new jsrsa.crypto.Signature({'alg':'SHA1withRSA'});
    let key = jsrsa.KEYUTIL.getKey(transaction.sender)
    let data = transaction.getDataString();
    sig.init(key);
    sig.updateString(data);
    return sig.verify(transaction.signature);
  }

  getInputs(name,balance){
    name = (typeof name === "string") ? name : jsrsa.KEYUTIL.getPEM(name);
    let potentialInputs = [];
    let tempBalance = 0;
    for (var i = this.blocks.length-1; i >= 0 ; i--) {
      let blockData = JSON.parse(this.blocks[i].data);
      for (var j = 0; j < blockData.length; j++) {
        let input = blockData[j];
        if (input.data.to == name) {
          potentialInputs.push({
            "block":this.blocks[i].hash,
            "transaction":input.id,
          });
          tempBalance += input.data.amount;
        }
        if (tempBalance >= balance) {
          return potentialInputs;
        }
      }
    }
    if (tempBalance < balance) {
      return undefined;
    }
    return potentialInputs;
  }

  checkInputs(transactionInputs,sender,balance){
    let blockInputs = this.getInputs(sender,balance);
    return !transactionInputs.map((element) => {blockInputs.includes(element)}).includes(false);
  }

  getByName(name){
    for (var i = 0; i < this.blocks.length; i++) {
      for (var j = 0; j < this.blocks[i].data.length; j++) {
        this.blocks.data[i]
      }
    }
  }

  update(){
    if (this.pending.length >= 4) {
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
