module.exports.push = function (good,collection) {
    const config=require('./config');
    var MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("wp2018_groupA");
        var myobj =good;
    		dbo.collection(collection).insertMany(myobj, function(err, res) {
        	if (err) throw err;
        	console.log("Number of documents inserted: " + res.insertedCount);
        	db.close();
    		});
    });
};
module.exports.query=function(keyword){
    var re=new RegExp(keyword);
    var query={"car": re};
    const config=require('./config');
    var MongoClient = require('mongodb').MongoClient;
    const url = `mongodb://${config.mongodb.user}:${config.mongodb.password}@${config.mongodb.host}/${config.mongodb.database}`;
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo =db.db('wp2018_groupA');
        dbo.collection("test").find(query).toArray(function(err,result){
            if(err) throw err;
            console.log(result);
            db.close();
        });
    });
};
