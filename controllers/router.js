


/*

routing module


*/

module.exports = function(app,gossip){

  app.get('/',(req,res) => {
    console.log("[GET] /");
    res.setHeader('Content-Type','application/json');
    res.send(JSON.stringify({
      "message":"Hello!"
    }));
  });

  app.get('/update',(req,res) => {
    console.log("[GET] /update");
    res.send(req.body);
  });

  app.post('/transaction',(req,res) => {
    console.log(req.body);
    res.send(txPool.recieveTx(req.body));
  });

  app.get('/gossip/test',(req,res) => {
    console.log("Transactions have been randomly submitted");
    gossip.createRandomTx(req.param('num'));
    res.send("Transaction Submitted!");
  });

  app.get('/wallet',(req,res) => {
    console.log(req.body);
    console.log(req.param('pubKey'));
    res.send(req.body);
  });

  app.get('/data',(req,res) => {
    console.log(req.body);
    res.send(req.body);
  });

  app.get('/gossip/chain',(req,res) => {
    console.log(req.body);
    res.send({
      "blocks":gossip.blockchain.getChain()
    });
  });

  app.post('/gossip/chain',(req,res) => {
    console.log(req.body);
    let result = gossip.validateNewBlockchain(JSON.parse(req.body.blockchain),JSON.parse(req.body.txs));
    res.send(result);
  });

  app.get('/gossip/txs',(req,res) => {
    // return known transactions
    let txs = gossip.getTransactions();
    res.send(JSON.stringify(txs));
  });

  app.get('/gossip/info',(req,res) => {
    res.send(gossip.getInfo());
  });




}
