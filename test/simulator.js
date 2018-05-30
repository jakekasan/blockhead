const User = require('./user.js');
const sleep = require('sleep');

module.exports = class Simulator {
  constructor(blockchain,numberOfUsers,numberOfTransactionsPerMinute,txPool) {
    this.blockchain = blockchain;
    this.txPool = txPool;
    this.users = this.makeUsers(numberOfUsers);
    this.numberOfTransactionsPerMinute = numberOfTransactionsPerMinute;
    //console.log("Printing txPool");
    //console.log(txPool);
    this.setup();
  }

  makeUsers(numberOfUsers){
    let users = [];
    for (var i = 0; i < numberOfUsers; i++) {
      let name = potential_names[Math.floor(Math.random()*potential_names.length)] + " " + potential_surnames[Math.floor(Math.random()*potential_surnames.length)]
      let user = new User(name,"password",this.blockchain,this.txPool)
      //this.blockchain.gatherTxs();
      users.push(user);
    }
    this.blockchain.findWallets();
    return users;
  }

  setup(){
    for (let user of this.users) {
      //console.log("Master wallet sending money to",user.getPublicKey());
      //console.log("Tx succeeded?",this.blockchain.masterWallet.sendMoneyJson(10000000,user.getPublicKey()));
      this.blockchain.masterWallet.sendMoneyJson(100000,user.getPublicKey());
      this.blockchain.gatherTxs();
    }
  }

  runSimulator(numTxs){
    // if (numTxs == undefined) {
    //   let numTxs = this.numberOfTransactionsPerMinute;
    // }
    for (let i = 0; i < numTxs; i++) {
      (this.getRandomUser()).makePayment();
      //this.blockchain.gatherTxs();
    }
    //this.blockchain.print()
    //this.blockchain.findWallets();

  }

  getRandomUser(){
    return this.users[Math.floor(Math.random()*this.users.length)];
  }
}


var potential_names = ["Adam","Ben","Chandler","Daryl","Ephelia","Francine","George","Henrietta","Isobel","Janice","Dwight","Joey","Ross","Rachel","Pheobe","Pam"];
var potential_surnames = ["Geller","Smith","Davis","Hannah","Carrola","Buffay","Halpert","Schrute","Bing","Tribiani","Greene","Bluth"];
