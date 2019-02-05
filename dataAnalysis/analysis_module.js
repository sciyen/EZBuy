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

