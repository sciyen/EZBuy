module.exports.push = function (good,collection) {
    const config=require('./config');
    var MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("wp2018_groupA");
        var myobj =good;
        for(var i=0;i<myobj.length;i++){
          myobj[i]["createTime"]=new Date();
        }
        dbo.collection(collection).createIndex({"createTime":1},{expireAfterSeconds:30*24*60*60})
        dbo.collection(collection).createIndex({id:1},{unique:true})
        dbo.collection(collection).insertMany(myobj, function(err, res) {
         // if (err) throw err;
         // console.log("Number of documents inserted: " + res.insertedCount);
          db.close();
          });
      });
};
module.exports.query=function(keyword, results ,collection){
    console.log('Searching for ', keyword.shopping_cart);
    var query=[];
    for(var i=0;i<keyword.shopping_cart.length;i++){
      var reg =new RegExp(keyword.shopping_cart[i].item);
      query.push(reg);
    }
    console.log('Query= ', query);
    const config=require('./config');
    var MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo =db.db('wp2018_groupA');
        dbo.collection(collection).find({message:{$in:query}}).toArray(function(err,result){
            if(err) throw err;
            results.success--;
            console.log('Success in query', results.success);
            var goodList = [];
            if(result.length > 0){
              for(var i =0;i<result.length;i++){
                var obj = {};
                obj.item = i.toString();
                obj.post_id = result[i].id;
                goodList.push(obj);
              }
              results[keyword.client_id] = goodList;
            }
            db.close();
        });
    });
};

module.exports.listAll=function(collection){
    const config=require('./config');
    var MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo =db.db('wp2018_groupA');
        dbo.collection(collection).find({}).toArray(function(err,result){
            if(err) throw err;
            console.log(result);
            db.close();
        });
    });
};

module.exports.removeAll=function(collection){
    const config=require('./config');
    var MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo =db.db('wp2018_groupA');
        dbo.collection(collection).deleteMany({}, (err)=>{
          if(err) console.log('Remove Error, ', err);})
    });
};
