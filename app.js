var express = require('express');
var http = require('http');
var fs = require('fs');
var cjs = require('crypto-js');
const ursa = require('ursa');
const cryptico = require('cryptico')
const jsrsa = require("jsrsasign");
const crypto = require("crypto")
const BlockChain = require("./bin/blockchain.js");
const Block = require("./bin/block.js");
const Transaction = require('./bin/transaction.js');
const Wallet = require('./bin/wallet.js');
const bigInt = require('big-integer');
const forge = require('forge')




var app = express();

app.listen(8080, () => {

  var rsaKeypair = jsrsa.KEYUTIL.generateKeypair("RSA", 1024);
  let rsaPub = rsaKeypair.pubKeyObj;
  let rsaPrv = rsaKeypair.prvKeyObj;
  let message = "sup dude";

  let sig = new jsrsa.crypto.Signature({"alg":"SHA1withRSA"});
  sig.init(rsaPrv);
  sig.updateString(message);
  let signature = sig.sign();

  let sig2 = new jsrsa.crypto.Signature({"alg":"SHA1withRSA"});
  sig2.init(rsaPub);
  sig2.updateString(message);
  console.log(sig2.verify(signature));


});

var runBlockchain = function(){

  initialData = [];
  initialData.push(new Transaction(null,"Admin",100000,[],"Signature!").getData());
  initialData.push(new Transaction(null,"Barry",100000,[],"Signature!").getData());
  initialData.push(new Transaction(null,"Charlie",100000,[],"Signature!").getData());
  initialData.push(new Transaction(null,"David",100000,[],"Signature!").getData());
  genesisBlock = new Block(initialData,1);
  blockchain = new BlockChain(1,genesisBlock);

  adminWallet = new Wallet("Admin",blockchain);
  barryWallet = new Wallet("Barry",blockchain);
  charlieWallet = new Wallet("Charlie",blockchain);
  davidWallet = new Wallet("David",blockchain);

  adminWallet.sendMoney(1000,"Barry");
  adminWallet.sendMoney(1000,"Charlie");
  adminWallet.sendMoney(1000,"David");
  adminWallet.sendMoney(1000,"Eleanor");
  blockchain.update();
  adminWallet.sendMoney(1000,"Florence");
  adminWallet.sendMoney(1000,"Gary");
  adminWallet.sendMoney(1000,"Hector");
  adminWallet.sendMoney(1000,"Isobel");
  blockchain.update();

  var names = ["Admin","Barry","Charlie","David","Eleanor","Florence","Gary","Hector","Isobel"];

  var limit = 20;
  var j = 0;
  for (var i = 0; i < limit; i++,j++) {
    if (j == 3) {
      blockchain.update();
      j = 0;
    }
    //let names = ["Admin","Barry","Charlie","David","Eleanor","Florence","Gary","Hector","Isobel"];
    let name = names[Math.floor(Math.random()*(names.length-1))];
    let wallet = new Wallet(name,blockchain);
    let names2 = names.filter((x) => { return (x != name)});

    let recipient = names2[Math.floor(Math.random()*(names2.length-1))];
    if (recipient == undefined) {
      console.log("RED FLAG!!!");
    }
    if (!wallet.sendMoney(Math.floor(Math.random()*10)+1,recipient)){
      continue;
    }
    console.log(names);
    console.log("From " + name + " to " + recipient);
  }


  blockchain.print();


}
