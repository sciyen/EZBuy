const tokenFilename = 'token.json';
const DEBUG = true
var fs = require('fs');
var tokenFile = fs.readFileSync(tokenFilename);
var TOKEN = JSON.parse(tokenFile);

function isExist(obj){
  return obj?true:false;
}

export function loadFeeds() {
  $.ajax({
    method: "get",
    url: `https://graph.facebook.com/${TOKEN['GROUP_ID']}/feed?fields=message,description,picture&access_token=${TOKEN['ACCESS_TOKEN']}`,
    success: function(feeds){
      if(DEBUG)
        console.log(feeds);
      departFeeds(feeds);
    }
  })
}

export function departFeeds(feeds){
  for(var item in feeds.data){
    if(isExist(feeds.data[item].message)){
      var message = feeds.data[item].message;
      var id = feeds.data[item].id;
      var picUrl = feeds.data[item].picture;
    }
  }
}
