


/*

routing module


*/

module.exports = function(app,blockchain,txPool){

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
      "blockchain":blockchain.getString());
      "length":blockchain.blocks.length;
    });
  });

  app.post('/gossip',(req,res) => {
    console.log(req.body);
    if (req.body.blocklength > blockchain.blocks.length) {

    }
  })



}
