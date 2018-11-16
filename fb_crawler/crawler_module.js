const LOG_FEEDS = false;
const tokenFilename = 'token.json';

var fs = require('fs');
const https = require('https');

var tokenFile = fs.readFileSync(tokenFilename);
var TOKEN = JSON.parse(tokenFile);

const graphUrl = `https://graph.facebook.com/${TOKEN['GROUP_ID']}/feed?fields=message,description,picture&access_token=${TOKEN['ACCESS_TOKEN']};`

var crawler = {
  /* Filter bad feeds */
  isExist: function isExist(obj){
    return obj?true:false;
  },

  /* Scratch feeds from FB group */
  loadFeeds: function loadFeeds(callback) {
    https.get(graphUrl, (res)=>{                      // FB API need https protocal
      console.log('statusCode: ', res.statusCode);
      console.log('header: ', res.headers);           
      var body = '';
      res.on('data', (chunk)=>{                       // data will be departed with serveral parts
        body += chunk; });                            // So we need to assemble them manually
      res.on('end', ()=>{                             // Last part
        var content = JSON.parse(body);
        if(LOG_FEEDS)
          console.log('JSON content=', content);
        callback(this.departFeeds(content));           // Use departFeeds to filter usable feeds
      });
    })
  },
  
  /* Filter usable feeds by checking message object exist */
  departFeeds: function departFeeds(feeds){
    var usableFeeds = {};
    for(var item in feeds.data){
      if(this.isExist(feeds.data[item].message)){
        var message = feeds.data[item].message;
        var id = feeds.data[item].id;
        var picUrl = feeds.data[item].picture;
        if(LOG_FEEDS){
          console.log(`item ${item}=========================================================================================`);
          console.log(`    id= ${id}`);
          console.log(`    msg= ${message}`);
          console.log(`    pic= ${picUrl}`);
        }
        usableFeeds[item] = feeds.data[item];
      }
    }
    return usableFeeds;
  }
}

module.exports = crawler;
