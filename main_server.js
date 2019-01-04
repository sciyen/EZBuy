var crawler = require('./fb_crawler/crawler_module.js');
var user = require('./user/user_module.js');
var good = require('./good/good_module');
var chatbot = require('./chatbot/chatbot_module.js');
var express = require('express');
const app = express();
const port = 10418;

const goodCollectionName = 'EZBuyGoods';
const userCollectionName = 'client_info';

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
function update_item(){
  user.listAll("item_info",(item_info)=>{
    for(var i=0;i<item_info.length;++i){
      good.update_item_info("item_info",item_info[i]);
    }
  });
}
app.get("/crawler_request", (req, res)=>{
  console.log('Get crawler request from chatbot');
  //findMatch();
})

function refresh(){
  console.log('Refreshing Good datasets');
  refreshGoods();
  console.log('Finding match goods');
  setTimeout(()=>{findMatch()}, 10000);
}
//removeAllGoods();
//refresh();
update_item();
//setInterval(()=>{refresh()}, 60*1000);
//app.listen(port);
//refreshGoods();
//findMatch();
//removeAllGoods();
//listAllGoods();
