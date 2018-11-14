const DEBUG = true
const tokenFilename = 'token.json';

var fs = require('fs');
const https = require('https');

var tokenFile = fs.readFileSync(tokenFilename);
var TOKEN = JSON.parse(tokenFile);

const graphUrl = `https://graph.facebook.com/${TOKEN['GROUP_ID']}/feed?fields=message,description,picture&access_token=${TOKEN['ACCESS_TOKEN']};`

var crawler = {
  isExist: function isExist(obj){
    return obj?true:false;
  },

  loadFeeds: function loadFeeds() {
    https.get(graphUrl, (res)=>{
      console.log('statusCode: ', res.statusCode);
      console.log('header: ', res.headers);
      res.on('data', (feeds)=>{
        if(DEBUG)
          process.stdout.write(feeds); 
        this.departFeeds(feeds);
      });
    })
  },
  
  departFeeds: function departFeeds(feeds){
    for(var item in feeds.data){
      if(isExist(feeds.data[item].message)){
        var message = feeds.data[item].message;
        var id = feeds.data[item].id;
        var picUrl = feeds.data[item].picture;
        console.log(`id= $id :`);
        console.log(message);
        console.log(picUrl);
      }
    }
  }
}

module.exports = crawler;
