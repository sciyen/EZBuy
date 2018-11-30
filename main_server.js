var crawler = require('./fb_crawler/crawler_module.js');
var user = require('./user/user_module.js');
var good = require('./good/good_module');
var https = require('https');
//var querystring = require('querystring');

const goodCollectionName = 'EZBuyGoods';
const userCollectionName = 'user_info';


function refreshGoods(){
  crawler.loadFeeds((feeds)=>{
    good.push(feeds, goodCollectionName);
    console.log('New feeds loaded');
  })
}

function listAllGoods(){
  good.listAll(goodCollectionName);
}

function removeAllGoods(){
  good.removeAll(goodCollectionName);
}

function waitForSuccess(results){
  if(results.success > 0)
    setTimeout(()=>{waitForSuccess(results)}, 500);
  else{
    console.log(results);
    delete results.success;
    const postData = JSON.stringify(results);
    const chatbotOption = {
      hostname:'luffy.ee.ncku.edu.tw',
      port:2236,
      path:'/match',
      method:'POST',
      headers:{
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
    var postReq = https.request(chatbotOption, (res)=>{
      console.log(`Get respond from chatbot server: ${res.statusCode}`);
    });
    console.log('Data sent: ', postData);
    postReq.write(postData);
    postReq.end();
  }
}

user.listAll(userCollectionName, (users)=>{
  var results = {};
  results.success = users.length;
  for(var i=0;i<users.length;i++){
    console.log(`User: ${users[i].client_name}`);
    good.query(users[i], results, goodCollectionName);
  }
  waitForSuccess(results);
});
//removeAllGoods();
//refreshGoods();
//listAllGoods();
