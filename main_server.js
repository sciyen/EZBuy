var crawler = require('./fb_crawler/crawler_module.js');
var good = require('./good/good_module');

const goodCollectionName = 'EZBuyGoods';

function refreshGoods(){
  crawler.loadFeeds((feeds)=>{
    console.log('New feeds loaded');
    good.push(feeds, goodCollectionName);
  })
}

refreshGoods();
