class Member {
  constructor(pubKey,addr) {
    this.pubKey = pubKey;
    this.addr = addr;
    this.spoiled = false;
  }

  broadcastTo(data){
    fetch(this.addr,{
      body: JSON.stringify(data),
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'user-agent':'Mozilla/4.0 MDN Example',
        'content-type':'application/json'
      },
      method:'POST',
      mode: 'cors',
      redirect: 'follow',
      referrer: 'no-referrer'
    });
  }

  checkOn(){
    return fetch(this.addr + "/gossip/txs").then(res => res.json()).then((data) => { return data }).catch(() => {return false});
  }
}
