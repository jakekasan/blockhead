


/*

routing module


*/

module.exports = function(app,blockchain){

  app.get('/',(req,res) => {
    console.log("[GET] /");
    console.log(_myConstant);
    res.setHeader('Content-Type','application/json');
    res.send(blockchain.getString());
  });

  app.get('/update',(req,res) => {
    console.log("[GET] /update");
    console.log(_myConstant);
    res.send(req.body);

  });

  app.post('/transaction',(req,res) => {
    console.log(req.body);
    console.log(_myConstant);
    res.send(req.body);
  });

  app.get('/wallet',(req,res) => {
    console.log(req.body);
    console.log(_myConstant);
    res.send(req.body);
  });

  app.get('/data',(req,res) => {
    console.log(req.body);
    console.log(_myConstant);
    res.send(req.body);
  });



}
