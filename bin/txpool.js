class TxPool {
  constructor(addr) {
    this.addr = addr;
    this.bc = bc;
    this.pool = [];
   }

  recieveTx(tx) {
    if (!validateTransaction(tx)) {
      return false;
    }
    this.pool.append({
      "txTime": Date.now(),
      "txData": tx
    });
    //this.pool = this.validatePool();
    return true;
  }

  getTx(){
    return this.pool.pop();
  }

  validatePool(){
    return this.pool.filter(obj => { validateTransaction(obj.txData) });
  }

  validateTransaction(tx){
    if (!this.bc.validateSignature(tx.signature,tx.sender,tx.data)){
      return false;
    }
    if (!this.bc.validateInputs(tx.inputs)){
      return false;
    }
    return true;
  }


}
