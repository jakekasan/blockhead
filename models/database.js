const cjs = require('crypto-js');
const jsrsa = require('jsrsasign');
const UserData = require('./userDataModel.js');

module.exports = class Database {
  constructor() {
    this.rows = [];
  }

  addData(wallet,password) {
    console.log("Adding to db...");
    let row = new UserData(wallet.name,cjs.SHA256(password),wallet.privateKey,wallet.publicKey);
    console.log("Added to db.");
    this.rows.push(row);
  }

  getPubKey(name){
    for (var i = 0; i < this.rows.length; i++) {
      if (name == this.rows[i].name) {
          return this.rows[i].publicKey;
      }
    }
    return undefined;
  }

  print(){
    for (var i = 0; i < this.rows.length; i++) {
      let row = this.rows[i];
      let myString = i.toString() + "->" + row.name + " : " + row.hash + " : " + row.privateKey + " : " + row.publicKey + "\n" + Array(100).fill("-").join("");
      console.log(myString);
    }
  }
}
