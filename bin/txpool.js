module.exports = class TxPool {
  constructor(addr,bc) {
    this.addr = addr;
    this.bc = bc;
    this.pool = [];
    this.sent = [];
   }

  recieveTx(tx) {
    // is the transaction valid? If not, reject..
    // if (!this.validateTransaction(tx)) {
    //   return false;
    // }

    (new Promise((res,rej) => {
      if (this.validateTransaction(tx)){
        res(tx)
      } else {
        rej(tx)
      }
    })).then(tx => {
      this.pool.push({
        "txData": tx,
        "txFee": JSON.parse(tx).inputs.map(input => { input.value }).reduce((acc,curr) => { acc + curr},0) - JSON.parse(tx).outputs.map(output => { output.value }).reduce((acc,curr) => { acc + curr},0)
      });
    });

    // includes pre-calculated fee for future sort function
    //
    // this.pool.push({
    //   //"txTime": Date.now(),
    //   "txData": tx,
    //   "txFee": JSON.parse(tx).inputs.map(input => { input.value }).reduce((acc,curr) => { acc + curr},0) - JSON.parse(tx).outputs.map(output => { output.value }).reduce((acc,curr) => { acc + curr},0)
    // });
    // //this.pool.push(tx);
    // return true;
  }

  getTx(){
    if (this.pool.length < 1) {
      return false;
    }

    // here is where the selection logic will go in the future
    // i.e. the txs with the highest fees will go through
    let chosen = this.pool.pop(0);
    this.sent.push(chosen);
    return chosen;
  }

  getAllTransactions(){
    // return transactions-only list (no fees)
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

  minedTransactions(data){
    this.pool.filter(txObj => {
      !(data.map(txB => {
        if (txB.hash != txObj.txData.hash) {
          return false;
        } else if (txB.signature != txObj.txData.signature) {
          return false;
        } else {
          return true;
        }
      }).includes(true));
    });
  }

  signalSuccess(){
    // block was mined
    this.sent.filter(() => false)
  }

  signalFailure(){
    // block was not mined
    for (let el of this.sent){
      this.pool.push(el);
    }
  }


}
