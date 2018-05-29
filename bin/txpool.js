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

    //this.pool.push(tx);
    return true;
  }

  getTx(){
    if (this.pool.length < 1) {
      return false;
    }
    let chosen = this.pool.pop(0);
    this.sent.push(chosen);
    return chosen;
  }

  getAllTransactions(){
    let txList = this.pool.map(tx => tx.txData);
    return txList;
  }

  validatePool(){
    return this.pool.filter(obj => { this.validateTransaction(obj.txData) });
  }

  validateTransaction(tx){
    //console.log("Validating transaction");
    tx = JSON.parse(tx);
    if (!this.bc.validateSignature(tx.signature,tx.sender,tx.hash)){
      //console.log("Invalid Signature");
      return false;
    }
    if (!this.bc.validateInputs(tx.inputs)){
      //console.log("Invalid Inputs");
      return false;
    }
    if (tx.inputs.map(input => { input.value }).reduce((acc,curr) => { acc + curr},0) < tx.outputs.map(output => { output.value }).reduce((acc,curr) => { acc + curr},0)){
      //console.log("Inputs are less than outputs");
      return false;
    }
    if (tx.outputs.map(output => { return (output.value < 0) }).includes(true)){
      //console.log("An output is negative");
      return false;
    }
    //console.log("Finished validating transaction");
    return true;
  }


}
