module.exports = class UserData {
  constructor(name,passwordHash,prvKey){
    this.name = name;
    this.passwordHash = passwordHash;
    this.prvKey = prvKey;
  }

  authenticateLogin(passwordHash){
    if (passwordHash == this.passwordHash) {
      return true;
    }
    return false;
  }

  getPrvKey(passwordHash){
    if (passwordHash == this.passwordHash) {
      return this.prvKey;
    }
    return undefined;
  }
  }
}

class ClassName {
  constructor() {

  }
}
