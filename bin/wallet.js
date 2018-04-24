const jsrsa = require("jsrsasign");

module.exports = class Wallet {
  constructor(initialBalance,name) {
    let temp = jsrsa.KEYUTIL.generateKeypair("RSA",1028);
    this.balance = (initialBalance) ? initialBalance : 100;
    this.name = name;
    this.publicKey = temp.pubKeyObj;
    this.privateKey = temp.prvKeyObj;
  }

  sendMoney(amount,recipient){
    if (amount < this.balance) {
      return false;
    }
    // otherwise, send money and return true

    return true;
  }

}
