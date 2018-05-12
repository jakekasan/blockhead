class User {
  constructor(name,pwd,bc) {
    this.name = name;
    static names.push(name);
    this.password = password;
    let keyObj = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
    this.wallet = new Wallet(name,bc,keyObj.prvKeyObj,keyObj.pubKeyObj);
    this.bc = bc;
    this.bc.addToDatabase(this.name,wallet);
  }


}
