class Simulator {
  constructor(blockchain,numberOfUsers,numberOfTransactions) {
    this.blockchain = blockchain;
    this.numberOfUsers = numberOfUsers;
    this.numberOfTransactions = numberOfTransactions;
  }

  makeUsers(numberOfUsers){
    users = [];
    for (var i = 0; i < numberOfUsers; i++) {
      let name = potential_names[Math.floor(Math.random()*potential_names.length)] + " " + potential_surnames[Math.floor(Math.random()*potential_surnames.length)]
      user.push(new User(name,"password",this.blockchain))
    }
  }
}


var potential_names = ["Adam","Ben","Chandler","Daryl","Ephelia","Francine","George","Henrietta","Isobel","Janice","Dwight","Joey","Ross","Rachel","Pheobe","Pam"];
var potential_surnames = ["Geller","Smith","Davis","Hannah","Carrola","Buffay","Halpert","Schrute","Bing","Tribiani","Greene","Bluth"];
