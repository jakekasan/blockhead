const cjs = require('crypto-js');
const jsrsa = require('jsrsasign');
const UserData = require('./userDataModel.js');
const Wallet = require('./../bin/wallet.js');

module.exports = class Database {
  constructor() {
    this.rows = [];
  }

  addData(wallet,password) {
    let row = new UserData(wallet.name,cjs.SHA256(password),wallet.privateKey,wallet.publicKey);
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

  getWallet(rowNum,blockchain){
    //console.log("Getting new wallet");
    let wallet = new Wallet(this.rows[rowNum].name,blockchain,this.rows[rowNum].privateKey,this.rows[rowNum].publicKey);
    //console.log("Got new wallet, now returning");
    return wallet;
  }

  getRandomWallet(blockchain){
    let rand = Math.floor(Math.random()*this.rows.length);
    return this.getWallet(rand,blockchain);
  }

  print(){
    for (var i = 0; i < this.rows.length; i++) {
      let row = this.rows[i];
      let myString = i.toString() + "->" + row.name + " : " + row.hash + " : " + row.privateKey + " : " + row.publicKey + "\n" + Array(100).fill("-").join("");
      console.log(myString);
    }
  }
}
