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
const bigInt = require("big-integer")


var app = express();

app.listen(8080, () => {
  console.log("Up and running on 8080");

  let mykey = jsrsa.KEYUTIL.generateKeypair("RSA",1024);
  //console.log(mykey.pubKeyObj);
  console.log(mykey.prvKeyObj.d.toString());
  intString = mykey.prvKeyObj.d.toString();
  console.log(bigInt(intString));

  console.log(bigInt(intString) == mykey.prvKeyObj.d);

});
