module.exports = class TxPool {
  constructor(addr,bc) {
    this.addr = addr;
    this.bc = bc;
    this.pool = [];
    this.sent = [];
   }

  recieveTx(tx) {
    if (!this.validateTransaction(tx)) {
      return false;
    }
    this.pool.push({
      //"txTime": Date.now(),
      "txData": tx,
      "txFee": JSON.parse(tx).inputs.map(input => { input.value }).reduce((acc,curr) => { acc + curr},0) - JSON.parse(tx).outputs.map(output => { output.value }).reduce((acc,curr) => { acc + curr},0)
    });
    return true;
  }

  getTx(){
    // in the future, this function will sort the list of known tXs by fee and always return the most profitable
    if (this.pool.length < 1) {
      return false;
    }
    let chosen = this.pool.pop(0);
    this.sent.push(chosen);
    return chosen;
  }

  validatePool(){
    return this.pool.filter(obj => { this.validateTransaction(obj.txData) });
  }

  validateTransaction(tx){
    console.log("Validating transaction");
    tx = JSON.parse(tx);
    console.log(JSON.stringify(tx,null,2));
    console.log(tx.signature);
    console.log(tx.sender);
    console.log(tx.hash);
    if (!this.bc.validateSignature(tx.signature,tx.sender,tx.hash)){
      console.log("Invalid Transaction");
      return false;
    }
    if (!this.bc.validateInputs(tx.inputs)){
      return false;
    }
    if (tx.inputs.map(input => { input.value }).reduce((acc,curr) => { acc + curr},0) < tx.outputs.map(output => { output.value }).reduce((acc,curr) => { acc + curr},0)){
      return false;
    }
    console.log("Finished validating transaction");
    return true;
  }


}
