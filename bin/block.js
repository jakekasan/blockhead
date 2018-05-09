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
    while (hash.substring(0,this.difficulty) != Array(this.difficulty).fill(0).toString()) {
      this.nonce++;
      hash = this.getHash().toString();
    }
    return hash;
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
    return JSON.parse(this.data);
  }
}
