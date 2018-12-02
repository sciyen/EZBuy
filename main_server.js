var crawler = require('./fb_crawler/crawler_module.js');
var user = require('./user/user_module.js');
var good = require('./good/good_module');
var chatbot = require('./chatbot/chatbot_module.js');

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

function findMatch(){
  user.listAll(userCollectionName, (users)=>{
    var results = {};
    results.success = users.length;
    for(var i=0;i<users.length;i++){
      console.log(`User: ${users[i].client_name}`);
      good.query(users[i], results, goodCollectionName);
    }
    chatbot.send(results);
  });
}

function refresh(){
  console.log('Refreshing Good datasets');
  refreshGoods();
  console.log('Finding match goods');
  findMatch();
}
setInterval(()=>{refresh()}, 60*1000);
//refreshGoods();
//findMatch();
//removeAllGoods();
//listAllGoods();
