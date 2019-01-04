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
        dbo.collection(collection).createIndex({"createTime":1},{expireAfterSeconds:60*60*24*14})
        dbo.collection(collection).createIndex({id:1},{unique:true,dropDups:true})
        try{
          dbo.collection(collection).insertMany(myobj, function(err, res) {
          //console.log("Number of documents inserted: " + err.nInserted);
          //console.log("errmsg" +"\n"+ err);
          db.close();
        },{ordered:false});
        }
        catch(err){
          return;
        }
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
            console.log(result);
            var goodList = [];
            if(result.length > 0){
              for(var i =0;i<result.length;i++){
                var obj={};
                for(var j=0;j<keyword.shopping_cart.length;j++){
                  var str=result[i]["message"];
                  console.log(str);
                  if(str.includes(keyword.shopping_cart[j].item)){
                    obj.item = keyword.shopping_cart[j].item;
                    obj.post_id = result[i].id;
                    goodList.push(obj);
                  }
                }
              }
            }
              console.log("goodList")
              console.log(goodList);
              results[keyword.client_id] = goodList;
              results.token=config.token;
          })
        db.close();
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
module.exports.itemMatch=function(results, collection){
    const DEBUGGER = false;
    console.log("ItemMatching...");
    const config=require('./config');
    var MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo =db.db(config.mongodb.database);

        dbo.collection(collection).find({}).forEach((doc)=>{
          var client = doc.subscribers.sort({last_match_time: -1});
          var post = doc.posts.sort({post_time: -1});
          if(DEBUGGER){
            console.log(`Item: ${doc.item}========================================`);
            console.log("Client list= ");
            console.log(client);
            console.log("Post list= ");
            console.log(post);
          }
          var postIndex = 0;
          var matchedPostId = [];
          client.forEach((cli, cliInd)=>{
            if(DEBUGGER)
              console.log(`ClientID = ${cli.client_id}= ${cli.last_match_time}`);
            while(postIndex < post.length
               && cli.last_match_time < post[postIndex].post_time){
              matchedPostId.push(post[postIndex].post_id);
              //console.log(`Push ${post[postIndex].post_id}`);
              postIndex++;
            }
            if(DEBUGGER){
              console.log("Insertion report");
              console.log(matchedPostId);
            }
            if(matchedPostId.length > 0){
              const id = cli.client_id;
              const info = {
                "item": doc.item,
                "post_id": matchedPostId
              }
              if(!results[id])
                results[id] = [];
              results[id].push(info);
            }
          })
          if(DEBUGGER){
            console.log("Result=");
            console.log(results);
          }
       })
      console.log("Result=");
      console.log(results);

    });
};

module.exports.update_item_info=function(collection,keyword){
    const config=require('./config');
    var MongoClient = require('mongodb').MongoClient;
    var item_info= keyword.posts.map(function(e){return e.post_id;});
    const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo=db.db("wp2018_groupA");
        dbo.collection("EZBuyGoods").find({"message":{$regex:keyword.item}}).toArray(function(err,match){
            for(var j=0;j<match.length;++j){
              if(item_info.indexOf(match[j].id)==-1){
                var obj={};
                obj.post_id=match[j].id;
                obj.post_time=match[j].updated_time;
                console.log(obj);
                keyword.posts.push(obj);
                keyword.last_update_time=Date.now();
              }
            }
            console.log(keyword);
            dbo.collection(collection).updateOne({"item":keyword.item},keyword);
            db.close();
          });
           //console.log(keyword);
           //dbo.collection(collection).updateOne({"item":keyword.item},keyword);
    });
};

