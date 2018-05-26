const Wallet = require('./../bin/wallet.js');
const TxPool = require('./../bin/txpool.js');
const jsrsa = require('jsrsasign');

module.exports = class User {
  constructor(name,pwd,bc,txPool) {
    this.name = name;
    this.txPool = txPool;
    this.password = pwd;
    let keyObj = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
    this.wallet = new Wallet(name,bc,keyObj.prvKeyObj,keyObj.pubKeyObj,this.txPool);
    this.bc = bc;
    this.bc.addToDatabase(this.wallet,pwd);
  }

  getPublicKey(){
    return this.wallet.getPublicKey();
  }

  makePayment(){
    //console.log("Making payment...");
    var to;
    do {
      to = this.bc.getRandomPublicKey();
    } while (to == this.wallet.publicKey);

    //console.log("My balance is",this.wallet.getBalance());

    var amount = Math.floor(Math.random()*this.wallet.getBalance());
    //console.log("\n");
    //console.log(this.wallet.publicKey);
    //console.log("sending",amount.toString(),"to",to);
    //console.log("\n");
    //console.log();
    this.wallet.sendMoneyJson(amount,to)
  }


}
