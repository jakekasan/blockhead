const User = require('./user.js');
const sleep = require('sleep');

module.exports = class Simulator {
  constructor(blockchain,numberOfUsers,numberOfTransactionsPerMinute) {
    this.blockchain = blockchain;
    this.users = this.makeUsers(numberOfUsers);
    this.numberOfTransactionsPerMinute = numberOfTransactionsPerMinute;
    this.setup();
  }

  makeUsers(numberOfUsers){
    let users = [];
    for (var i = 0; i < numberOfUsers; i++) {
      let name = potential_names[Math.floor(Math.random()*potential_names.length)] + " " + potential_surnames[Math.floor(Math.random()*potential_surnames.length)]
      let user = new User(name,"password",this.blockchain)

      users.push(user);
    }
    this.blockchain.findWallets();
    return users;
  }

  setup(){
    for (let user of this.users) {
      console.log("Master wallet sending money to",user.getPublicKey());
      console.log("Tx succeeded?",this.blockchain.masterWallet.sendMoney(100000,user.getPublicKey()));
      this.blockchain.update();
    }
    //this.blockchain.findWallets();
  }

  runSimulator(){
    // while (true) {
    //   for (let i = 0; i < this.numberOfTransactionsPerMinute; i++){
    //     (this.getRandomUser()).makePayment();
    //     this.blockchain.update();
    //   }
    //   sleep.sleep(5);
    // }

    this.blockchain.print();
    this.blockchain.findWallets();
  }

  getRandomUser(){
    return this.users[Math.floor(Math.random()*this.users.length)];
  }
}


var potential_names = ["Adam","Ben","Chandler","Daryl","Ephelia","Francine","George","Henrietta","Isobel","Janice","Dwight","Joey","Ross","Rachel","Pheobe","Pam"];
var potential_surnames = ["Geller","Smith","Davis","Hannah","Carrola","Buffay","Halpert","Schrute","Bing","Tribiani","Greene","Bluth"];
