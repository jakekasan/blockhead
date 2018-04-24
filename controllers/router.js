
/*



*/

module.exports = function(app){

  app.get('/',function(){
    // return nothing, ignore
  });

  app.get('/update',() => {
    console.log("[GET] update");
  });



}
