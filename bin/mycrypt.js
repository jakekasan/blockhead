function makeSignature(privateKey,data) {
  let sig = new jsrsa.crypto.Signature({"alg": "SHA1withRSA"});
  sig.init(privateKey);
  sig.updateString(data);
  return sig.sign().toString("hex");
}

function verifySignature(publicKey,data,signature) {
    let sig = new jsrsa.crypto.Signature({"alg": "SHA1withRSA"});
    sig.init(publicKey);
    sig.updateString(data);
    return sig2.verify(signature);
}


class MyRSA {
  constructor() {
    this.p = getPrime(7)
    this.q = getPrime(5)
    this.n = this.p*this.q;
    this.totn = (this.p-1)*(this.q-1);
  }

  print(){
    console.log("Public: ",this.q);
    console.log("Private: ",this.p);
  }
}


function isPrime(n){
  for (let i = n-1; i > 1; i--){
    if ((n % i) == 0) {
      return false;
    }
  }
  return true;
}

function getPrime(n){

  n = Math.floor((Math.random()*(10**n))+10**n);

  while (!isPrime(n)) {
    n++;
  }
  return(n);
}
