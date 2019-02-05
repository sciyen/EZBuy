var crawler=require('./crawler_module.js');
var good = require('../good/good_module');

const goodCollectionName = 'EZBuyGoods';
const userCollectionName = 'client_info';
const itemCollectionName = 'item_info';


function refreshGoodsByTime(startTime, endTime){
  crawler.loadFeedsByTime(startTime, endTime, (feeds)=>{
    good.push(feeds, goodCollectionName);
    console.log(`New feeds loaded, from ${startTime} to ${endTime}, ` + new Date());
  })
}

refreshGoodsByTime("01/01/2019", "01/03/2019");

/*
crawler.loadFeeds((feeds)=>{
  console.log(feeds);
  for(var item in feeds){
    console.log(feeds[item].updated_time);
  }
});*/
