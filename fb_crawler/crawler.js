var crawler=require('./crawler_module.js');

crawler.loadFeeds((feeds)=>{
  console.log(feeds);
  for(var item in feeds){
    console.log(feeds[item].updated_time);
  }
});
