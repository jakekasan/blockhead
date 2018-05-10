const jsrsa = require('jsrsasign');

module.exports = class Output {
  constructor(owner,value) {
    this.owner = (typeof owner === 'string' || owner instanceof String) ? owner : jsrsa.KEYUTIL.getPEM(owner);
    this.value = value;
    this.blockHash = undefined;
    this.transHash = undefined;
  }

  getOutput(){
    let data = {
      "owner":this.owner,
      "value":this.value
    };
    return data;
  }

  getInput(){
    let data = {
      "owner":this.owner,
      "value":this.value,
      "blockHash":this.blockHash,
      "transHash":this.transHash
    };
    return data;
  }

  setHashes(blockHash,transHash){
    this.blockHash = blockHash;
    this.transHash = transHash;
  }
}
