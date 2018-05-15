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
const bodyParser = require('body-parser');
const Simulator = require('./test/simulator.js');


const router = require('./controllers/router.js');


const bc = new BlockChain(1);
const simulator = new Simulator(bc,10,5);
var app = express();

app.use(bodyParser.json());

router(app,bc);

app.listen(8080, () => {

  simulator.runSimulator();

});
