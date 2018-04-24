var express = require('express');
var http = require('http');
var fs = require('fs');
var cjs = require('crypto-js');
const cryptico = require('cryptico')
const jsrsa = require("jsrsasign");
const crypto = require("crypto")
const BlockChain = require("./bin/blockchain.js");
const Block = require("./bin/block.js");
var app = express();

app.listen(8080, () => {
  console.log("Up and running on 8080");
  //
  // blockchain = new BlockChain(1);
  //
  // words = ["apple","banana","cupcake","donut","eclaire","froyo","gingerbread","honeycomb","ice cream sandwich","jelly bean","kitkat","lollipop","marshmellow","nugat","oreo"];
  // for (let i = 0; i < 20; i++){
  //   console.log("Adding block...");
  //   let blockstring = "";
  //   for (let j = 0; j < 20; j++) {
  //     blockstring += words[Math.floor(Math.random()*words.length)] + " ";
  //   }
  //   //blockstring = words[Math.floor(Math.random()*words.length)] + " " + words[Math.floor(Math.random()*words.length)] + words[Math.floor(Math.random()*words.length)] + words[Math.floor(Math.random()*words.length)];
  //   blockchain.addBlock(blockstring);
  // }
  //
  // console.log(blockchain.verifyBlockChain());
  //
  // blockchain.print();


  var jsKey = jsrsa.KEYUTIL.generateKeypair("RSA",1024);

  console.log(jsKey);
  //
  // var temp = crypto.createECDH("secp256k1");
  //
  // var tempKey = temp.generateKeys();
  //
  // console.log(temp.getPrivateKey());
  //
  // var pubKey = temp.getPublicKey().toString("hex")
  // var priKey = temp.getPrivateKey().toString("hex")
  //
  //
  // console.log(pubKey);
  // console.log(priKey);

  let pubKey = jsKey.pubKeyObj;
  let priKey = jsKey.prvKeyObj;

  let message = "Hello World!";

  var sig = new jsrsa.crypto.Signature({"alg": "SHA1withRSA"});
  sig.init(priKey);

  sig.updateString(message);

  var signature = sig.sign().toString("hex");

  console.log("Signature: ",signature);

  var sig2 = new jsrsa.crypto.Signature({"alg": "SHA1withRSA"});
  sig2.init(pubKey);

  sig2.updateString(message);

  console.log(sig2.verify(signature));

  // let passphrase = "Follow the white rabbit";
  //
  // let privateKey = cryptico.generateRSAKey(passphrase,1048);
  // let publicKey = cryptico.publicKeyString(privateKey);
  //
  // let message = "The unencrypted message";
  //
  // let signature = cryptico.encrypt(message,publicKey,privateKey);
  //
  // console.log(signature);
  // console.log(publicKey);
  // console.log(privateKey);
  // console.log(cryptico.decrypt(signature.cipher.toString(),publicKey));






  //console.log(rsa);
  //console.log(getPrime(10**8));
  //console.log(10**10);

});
