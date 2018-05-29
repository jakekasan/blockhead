class Gossip {
  constructor(blockchain,knownAddrs,txPool) {
    this.members = constructMembers(knownAddrs);
    this.blockchain = blockchain;
    this.txPool = txPool;
  }

  constructMembers(knownAddrs){
    members = [];
    for (let addr of knownAddrs){
      fetch(addr+"/info").then(res => res.json()).then(data => members.push(new Member(data.pubKey,data.blocks)));
    }
  }

  // validating incoming blockchain

  validateNewBlockchain(blockchain){
    if (blockchain.length >= this.blockchain.blocks.length) {
      return
    } else {
      if (this.blockchain.verifyBlockChain(blockchain)){
        this.blockchain = blockchain;
      }
    }

  }

  // ask for transactions

  getTransactions(){
    return this.txPool.getAllTransactions();
  }

  checkOnMember(member){
    // check that a member is active while also getting tXs
    member.checkOn().then(data => {
      if (data == false){
        // ignore
        console.log("Member not active");
      } else {
        console.log("Member is active");

      }
    });
  }

  compareTransactions(otherTxs){
    // compare tXs
    let myTxs = txPool.getAllTransactions();
    for (tx of otherTxs) {
      let result = myTxs.map(el => {(el.value == tx.value) && (el.owner == tx.owner)}).contains(true);
      if () {

      }
    }
  }
}
