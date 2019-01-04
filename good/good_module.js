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
<<<<<<< HEAD
/*module.exports.update_item_info=function(collection){
=======

module.exports.itemMatch=function(results, collection){
    const config=require('./config');
    var MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo =db.db(config.mongodb.database);

        dbo.collection(collection).find({}).forEach((doc)=>{
          /*var matched = doc.findAndModify( {
            query: { "$posts.post_time": {$gt: doc.subscribers.last_match_time } },
            update: { "$subscribers.last_match_time": doc.posts.post_time}
          })
          console.log(matched);*/

          console.log(`Item: ${doc.item}`);
          var client = doc.subscribers.sort({last_match_time: -1});
          console.log("Client list= ");
          console.log(client);
          var post = doc.posts.sort({post_time: -1});
          console.log("Post list= ");
          console.log(post);
        })
        /*
        dbo.collection(collection).find({ $query:{}, $orderby: {last_match_time:-1} }).toArray((err, result)=>{
          if(err) console.log('Remove Error, ', err);
          for(var item in result){

          console.log(result);
        })*/
    });
};


module.exports.update_item_info=function(collection){
>>>>>>> 6acc3b9248f866997ece544f6e3be96873f61ce4
    const config=require('./config');
    var MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo =db.db('wp2018_groupA');
        var temp={};
        //var item= dbo.collection(collection).find({}).toArray(function(err,result,temp){temp=result;});
        //console.log(temp);
        dbo.collection(collection).find({}).toArray(function(err,result){
            if(err) throw err;
            //console.log(result);
            for(var i=0;i<result.length;++i){
              var item_info= result[i].posts.map(function(e){return e.post_id;});
              var temp=result[i];
              //console.log(temp.item);
              dbo.collection("EZBuyGoods").find({"message":{$regex:result[i].item}}).toArray(function(err,good){
                //console.log(good);
                for(var j=0;j<good.length;++j){
                  if(item_info.indexOf(good[j].id)==-1){
                    var obj={};
                    obj.post_id=good[j].id;
                    obj.post_time=good[j].updated_time;;
                    temp.posts.push(obj);
                    temp.last_update_time=Date.now();
                //    console.log(temp);
                    //dbo.collection(collection).findOneAndDelete({"item":temp.item},function(err,res){});
                    //dbo.collection(collection).insert(temp,function(err,res){})

                  }
                }
                //console.log(temp.item);
               // dbo.collection(collection).findOneAndDelete({"item":temp.item},function(err,res){});
               // dbo.collection(collection).insert(temp,function(err,res){});i 
              }) 
            }
            db.close();
        });
    });
};
*/
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

