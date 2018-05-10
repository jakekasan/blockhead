const Block = require("./block.js");
const Transaction = require('./transaction');
const Wallet = require('./wallet.js');
const UserData = require('./../models/userDataModel.js');
const Output = require('./output.js');
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


    let masterWallet = new Wallet("God1",this,this.privateKey,this.publicKey);
    let genesisWallet = new Wallet("God2",this,genesisPrv,genesisPub);

    this.db = new DB();

    this.db.addData(masterWallet,pwd);
    this.db.addData(genesisWallet,pwd);




    console.log("New Transaction");
    let bigBang = new Transaction([],[new Output(this.publicKey,100000000000)],genesisPrv,this);
    this.blocks.push(new Block([bigBang.getTransactionString()],this.difficulty));

    console.log("GENESIS BLOCK PUSHED!");

    for (var i = 0; i < 20; i++) {
      let firstName = potential_names[Math.floor(Math.random()*potential_names.length)];
      let LastName = potential_surnames[Math.floor(Math.random()*potential_surnames.length)];
      let name = firstName + " " + LastName;
      let keyObj = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
      console.log("BLOCKCHAIN - making new wallet for " + name);
      let wallet = new Wallet(name,this,keyObj.prvKeyObj,keyObj.pubKeyObj);
      this.db.addData(wallet,LastName);
      let value = Math.floor(1000000*Math.random());

      if (!masterWallet.sendMoney(value,wallet.publicKey)){
        console.log("Transaction failed");
      };
      console.log("Transaction succeeded");
      this.update();
    }


    for (let i = 0; i < 2000; i++) {
      let walletA = this.db.getRandomWallet(this);
      let walletB = this.db.getRandomWallet(this);
      let amount = Math.floor(Math.random()*100);

      console.log("Attempting transaction");
      if (walletA.sendMoney(amount,walletB.publicKey)){
        console.log("Transaction succeeded");
      } else {
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

  checkInputs(transaction){
    return !transaction.inputs.map((txo) => { this.isOutputSpent(txo) }).includes(true);
  }

  isOutputSpent(output){
    // Does it even exist?
    if (this.blocks.length < 2) {
      return false;
    }
    var exists = false;
    for (var i = this.blocks.length - 1; i >= 0; i--) {
      let block = this.blocks[i].getObject();
      for (let j = 0; j < block.data.length; j++) {
        let transaction = JSON.parse(block.data[j]);
        for (let k = 0; k < transaction.inputs.length; k++){
          if (transaction.inputs[k] == output) {
            // output has been used
            return true;
          }
        }
        for (let k = 0; k < transaction.outputs.length; k++){
          if (transaction.outputs[k] == output) {
            // found the output
            exists = true;
          }
        }
      }
      if (exists) {
        return false;
      }
    }
  }

  getOutputs(publicKey,amount){
    //console.log("Getting outputs");
    let outputs = [];
    let balance = 0;
    //console.log("Logging block length:",this.blocks.length);

    // first check pending
    //console.log("PENDING POOL LENGTH:",this.pending.length);

    for (let j = 0; j < this.pending.length; j++) {
      let transaction = JSON.parse(this.pending[j]);
      outputs = outputs.filter((txo) => { !transaction.inputs.includes(txo) });
      balance = 0;
      balance = outputs.map((txo) => { txo.value }).reduce((acc,el) => (el + acc),balance);
      for (let k = 0; k < transaction.outputs.length; k++){
        let oldOutput = transaction.outputs[k];
        if (oldOutput.owner == publicKey) {
          //console.log("Creating new output with name:",oldOutput.owner," \tvalue:",oldOutput.value);
          let newOutput = new Output(oldOutput.owner,oldOutput.value);
          balance += oldOutput.value;
          newOutput.setHashes("current",transaction.hash);
          outputs.push(newOutput);
        }
      }
      if (balance >= amount) {
        return outputs;
      }
    }


    // now check written blocks
    for (let i = this.blocks.length-1; i >= 0; i--) {
      let block = this.blocks[i].getObject();

      //console.log(block);
      //block.data = JSON.parse(block.data);
      for (let j = 0; j < block.data.length; j++) {
        let transaction = JSON.parse(block.data[j]);
        outputs = outputs.filter((txo) => { !transaction.inputs.includes(txo) });
        balance = 0;
        balance = outputs.map((txo) => { txo.value }).reduce((acc,el) => (el + acc),balance);
        for (let k = 0; k < transaction.outputs.length; k++){
          let oldOutput = transaction.outputs[k];
          if (oldOutput.owner == publicKey) {
            //console.log("Creating new output with name:",oldOutput.owner," \tvalue:",oldOutput.value);
            let newOutput = new Output(oldOutput.owner,oldOutput.value);
            balance += oldOutput.value;
            newOutput.setHashes(block.hash,transaction.hash);
            outputs.push(newOutput);
          }
        }
        if (balance >= amount) {
          return outputs;
        }
      }
    }
    return false;
  }

  getBalance(publicKey){
    let outputs = [];
    if (this.blocks.length < 2) {
      return 0;
    }
    for (var i = 0; i < this.blocks.length; i++) {
      let block = this.blocks[i].getObject();
      for (let j = 0; j < block.data.length; j++) {
        let transaction = JSON.parse(block.data[j]);
        //console.log("\n\nPOINT OF FAILURE");
        //console.log(transaction.outputs);
        outputs = outputs.filter((txo) => {!transaction.inputs.includes(txo)});
        for (let k = 0; k < transaction.outputs.length; k++) {
          let output = transaction.outputs[k];
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
    return outputs.reduce((acc,cur) => acc + cur.value );
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
