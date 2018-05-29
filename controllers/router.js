


/*

routing module


*/

module.exports = function(app,gossip){

  app.get('/',(req,res) => {
    console.log("[GET] /");
    res.setHeader('Content-Type','application/json');
    res.send(blockchain.getString());
  });

  app.get('/update',(req,res) => {
    console.log("[GET] /update");
    res.send(req.body);
  });

  app.post('/transaction',(req,res) => {
    console.log(req.body);
    res.send(txPool.recieveTx(req.body));
  });

  app.get('/wallet',(req,res) => {
    console.log(req.body);
    res.send(req.body);
  });

  app.get('/data',(req,res) => {
    console.log(req.body);
    res.send(req.body);
  });

  app.get('/gossip',(req,res) => {
    console.log(req.body);
    res.send({
      "blockchain":gossip.blockchain.getString());
    });
  });

  app.post('/gossip',(req,res) => {
    console.log(req.body);
    gossip.validateNewBlockchain(JSON.parse(req.body.blockchain),JSON.parse(req.body.txs));
  });

  app.get('/gossip/tx',(req,res) => {
    // return known transactions
  })




}
