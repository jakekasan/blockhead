var express = require('express');
var http = require('http');
var fs = require('fs');
var cjs = require('crypto-js');
//const ursa = require('ursa');
const cryptico = require('cryptico')
const jsrsa = require("jsrsasign");
const crypto = require("crypto")
const BlockChain = require("./bin/blockchain.js");
const Block = require("./bin/block.js");
const Transaction = require('./bin/transaction.js');
const Wallet = require('./bin/wallet.js');
const bigInt = require('big-integer');
const forge = require('forge')
const bodyParser = require('body-parser');
const Simulator = require('./test/simulator.js');
const TxPool = require('./bin/txpool.js');
const Gossip = require('./gossip/gossip.js');

const router = require('./controllers/router.js');


const bc = new BlockChain(1);
const txPool = new TxPool("home",bc);
bc.setTxPool(txPool);
const simulator = new Simulator(bc,10,500,txPool);
const gossip = new Gossip(bc,[],txPool,simulator);
var app = express();

app.use(bodyParser.json());

router(app,gossip);

var blockLoop = setInterval(() => {
  console.log(" -- Loop -- ");
  gossip.update();
},1000);

app.listen(8080, () => {

  simulator.runSimulator();

});
