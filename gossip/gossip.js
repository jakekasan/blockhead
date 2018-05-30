const jsrsa = require('jsrsasign');

module.exports = class Gossip {
  constructor(blockchain,knownAddrs,txPool,simulator) {
    this.members = [];
    this.blockchain = blockchain;
    this.txPool = txPool;
    this.publicKey = jsrsa.KEYUTIL.getPEM(this.blockchain.publicKey);
    this.aliveSince = new Date(Date.now());
    this.constructMembers(knownAddrs);
    this.simulator = simulator;
  }

  constructMembers(knownAddrs){
    if (knownAddrs == []){
      return
    }
    let members = [];
    for (let addr of knownAddrs){
      fetch(addr+"/info").then(res => res.json()).then(data => members.push(new Member(data.pubKey,data.blocks)));
    }
  }

  // validating incoming blockchain

  validateNewBlockchain(blockchain){
    if (blockchain.length >= this.blockchain.blocks.length) {
      return false;
    } else {
      if (this.blockchain.verifyBlockChain(blockchain)){
        this.blockchain = blockchain;
        return true;
      } else {
        return false;
      }
    }
  }

  // ask for transactions
  getTransactions(){
    return this.txPool.getAllTransactions();
  }

  getInfo(){
    let me = {
      "publicKey":this.publicKey,
      "aliveSince":this.aliveSince,
      "txPoolSize":this.txPool.pool.length,
      "blockChainSize":this.blockchain.blocks.length
    };
    return me;
  }

  checkOnMember(member){
    // check that a member is active while also getting tXs
    member.checkOn().then(data => {
      if (data == false){
        // ignore
        console.log("Member not active");
      } else {
        console.log("Member is active");
        compareTransactions(data);
      }
    });
  }

  checkOnAllMembers(){
    if (this.members.length < 1) {
      return;
    }
    for (let member of this.members) {
      checkOnMember(member);
    }
  }

  compareTransactions(otherTxs){
    // compare tXs
    let myTxs = txPool.getAllTransactions();
    for (tx of otherTxs) {
      let result = myTxs.map(el => {(el.value == tx.value) && (el.owner == tx.owner)}).contains(true);
      if (!result) {
        // if result is false, then the transaction is new, so we add it to our list of transactions
        txPool.recieveTx(tx);
        myTxs = txPool.getAllTransactions();
      }
    }
  }

  update(){
    this.blockchain.update();
    this.checkOnAllMembers();
  }

  createRandomTx(amount){
    if (amount == undefined) {
      this.simulator.runSimulator(50);
    }
      this.simulator.runSimulator(amount);
  }
}
