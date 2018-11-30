module.exports.send = function send(results){
  var request = require('request');
  if(results.success > 0)
    setTimeout(()=>{send(results)}, 500);
  else{
    console.log(results);
    delete results.success;
    const chatbotOption = {
      url:'https://luffy.ee.ncku.edu.tw:2236/match',
      method:'POST',
      json:results
    };
    request(chatbotOption, (err, res, body)=>{
      if(err) throw(err);
      console.log(`Get respond from chatbot server: ${res.statusCode}`);
    });
    //console.log('Data sent: ', results);
  }
};

