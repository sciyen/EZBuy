var crawler = require('./fb_crawler/crawler_module.js');
var user = require('./user/user_module.js');
var good = require('./good/good_module');
var chatbot = require('./chatbot/chatbot_module.js');
var express = require('express');
const app = express();
const port = 10418;

const goodCollectionName = 'EZBuyGoods';
const userCollectionName = 'client_info';
const itemCollectionName = 'item_info';

const crawlerUpdateMin = 5;
const matchUpdateSec = 10;


function refreshGoods(){
  crawler.loadFeeds((feeds)=>{
    good.push(feeds, goodCollectionName);
    console.log('New feeds loaded, ' + new Date());
  })
}

function listAllGoods(){
  good.listAll(goodCollectionName);
}

function clearAllCollections(){
  good.removeAll(goodCollectionName);
  good.removeAll(userCollectionName);
  good.removeAll(itemCollectionName);
}

function update_item(){
  user.listAll("item_info",(item_info)=>{
    for(var i=0;i<item_info.length;++i){
      good.update_item_info("item_info",item_info[i]);
    }
  });
}

function refresh(){
  update_item();
  setTimeout(()=>{good.itemMatch(itemCollectionName, (results)=>{
    if(Object.keys(results).length > 1) 
      chatbot.send(results);
  })}, 1000);
}
/*
app.get("/crawler_request", (req, res)=>{
  console.log('Get crawler request from chatbot');
  refresh();
})
*/
//refreshGoods();
refresh();
setInterval(()=>{refreshGoods()}, crawlerUpdateMin*60*1000);
setInterval(()=>{refresh()}, matchUpdateSec*1000);


//app.listen(port);









/*
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
}*/

