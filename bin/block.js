const cjs = require("crypto-js");

module.exports = class Block {
  constructor(data,difficulty,prevHash = undefined) {
    this.data = (typeof data === "string") ? data : JSON.stringify(data); // json of transaction
    this.prevHash = (prevHash) ? prevHash : "";
    this.difficulty = difficulty;
    this.nonce = 0;
    this.hash = this.mineBlock();
  }

  getHash(){
    return cjs.SHA256(this.prevHash + this.data + this.nonce.toString());
  }

  mineBlock() {
    var hash = this.getHash().toString();
    while (hash.substring(0,this.difficulty) != Array(this.difficulty).fill(0).join("")) {
      this.nonce++;
      hash = this.getHash().toString();
    }
    console.log("Block Mined");
    return hash;
  }

  getObject(){
    let data = {
      "data":this.getData(),
      "hash":this.hash,
      "nonce":this.nonce,
      "prevHash": this.prevHash
    };
    return data;
  }

  getObjectString(){
    return JSON.stringify(getObject,null,2)
  }

  print(){
    let data = {
      "Data":this.getData(),
      "Hash":this.hash,
      "Nonce":this.nonce,
      "Previous Hash": this.prevHash
    }
    console.log(JSON.stringify(data,null,2));
  }

  getData(){
    //console.log("BLOCK - parsing JSON data");
    let data = [];
    for (let transaction of JSON.parse(this.data)) {
      data.push(JSON.parse(transaction));
    }
    return data;
  }
}
