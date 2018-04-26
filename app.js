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
const bigInt = require("big-integer");


var app = express();

app.listen(8080, () => {



  transaction = new Transaction(null,"Admin",100000,[],"Signature!");
  genesisBlock = new Block(transaction,1);
  blockchain = new BlockChain(1,genesisBlock);

  adminWallet = Wallet("Admin",blockchain);
  barryWallet = Wallet("Barry",blockchain);
  charlieWallet = Wallet("Charlie",blockchain);
  davidWallet = Wallet("David",blockchain);

  blockchain.addBlock(new Transaction("Admin","Barry",100,transaction));
  transaction = new Transaction("Barry","Charlie",100);
  blockchain.addBlock()



});
