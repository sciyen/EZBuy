const info_subscribers = [
{
  $project: {
    name: "$item",
    count: {$size: {"$ifNull": ["$subscribers", []]}}}
},
{
  $sort: {"count": -1}
}];

const info_posts = [
{
  $project: {
    name: "$item",
    count: {$size: {"$ifNull": ["$posts", []]}}}
},
{
  $sort: {"count": -1}
}];
module.exports.getPopularItems=function(sortBy, callback){
  const collection = "item_info";
  const config=require('./config');
  var MongoClient = require('mongodb').MongoClient;
  const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
  MongoClient.connect(url,function(err,db){
      if(err) throw err;
      var dbo =db.db('wp2018_groupA');
      var info = info_posts;
      if(sortBy == "Subscribers")
        info = info_subscribers;
      dbo.collection(collection).aggregate(info).toArray(function(err,result){
          if(err) throw err;
          //console.log(result);
          db.close();
          callback(result);
      });
  });
};

function getCollectionCount(collection, callback){
  const config=require('./config');
  var MongoClient = require('mongodb').MongoClient;
  const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
  MongoClient.connect(url,function(err,db){
      if(err) throw err;
      var dbo =db.db('wp2018_groupA');
      var result = dbo.collection(collection).countDocuments({}, (err, count)=>{
        if(err) throw err;
        callback(count);
      });
  });
};
module.exports.getClientCount=function(callback){
  const collection = "client_info";
  getCollectionCount(collection, (count)=>{
    callback(count);
  })  
};
module.exports.getItemCount=function(callback){
  const collection = "item_info";
  getCollectionCount(collection, (count)=>{
    callback(count);
  })  
};
module.exports.getGoodCount=function(callback){
  const collection = "EZBuyGoods";
  getCollectionCount(collection, (count)=>{
    callback(count);
  })  
};

