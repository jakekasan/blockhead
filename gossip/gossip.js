class Gossip {
  constructor(blockchain,knownAddrs) {

  }

  constructMembers(knownAddrs){
    members = [];
    for (let addr of knownAddrs){
      fetch(addr+"/info").then(res => res.json()).then(data => members.push(new Member(data.)))
    }
  }
}
