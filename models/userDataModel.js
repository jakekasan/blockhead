const cjs = require('crypto-js');
const jsrsa = require('jsrsasign');

module.exports = class UserData {
  constructor(name,passwordHash,prvKey,pubKey){
    this.name = name;
    this.passwordHash = passwordHash;
    this.privateKey = prvKey;
    this.publicKey = pubKey;
  }

  authenticateLogin(passwordHash){
    if (passwordHash == this.passwordHash) {
      return true;
    }
    return false;
  }

  getPrvKey(passwordHash){
    if (passwordHash == this.passwordHash) {
      return this.prvKey;
    }
    return undefined;
  }

}
