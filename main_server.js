var crawler = require('./fb_crawler/crawler_module.js');
var good = require('./good/good_module');

const goodCollectionName = 'EZBuyGoods';

function refreshGoods(){
  crawler.loadFeeds((feeds)=>{
    console.log('New feeds loaded');
    good.push(feeds, goodCollectionName);
  // console.log(feeds);
  })
}

function listAllGoods(){
  good.listAll(goodCollectionName);
}

function removeAllGoods(){
  good.removeAll(goodCollectionName);
}

removeAllGoods();
refreshGoods();
listAllGoods();
