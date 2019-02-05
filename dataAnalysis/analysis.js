var analysis = require("./analysis_module");
analysis.getPopularItems("Subscribers", (results)=>{
  //console.log(result);
  var BreakException = {};
  try{
    results.forEach((item, index)=>{
      if(item.count > 1 && index <= 20)
        console.log(`Name= ${item.name} \t Count= ${item.count}`);
      else{
        console.log(`Other= ${results.length - index}`);
        throw BreakException;
      }
    });
  }catch(e){
    if(e!=BreakException) console.log(e);
  }
});

