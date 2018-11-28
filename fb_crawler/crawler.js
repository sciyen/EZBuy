var crawler=require('./crawler_module.js');

crawler.loadFeeds((feeds)=>{
  console.log('Feeds= ', feeds);
});
