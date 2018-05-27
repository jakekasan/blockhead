class Member {
  constructor(pubKey,addr) {
    this.pubKey = pubKey;
    this.addr = addr;
  }

  broadcastTo(data){
    fetch(this.addr,data)
  }
}
