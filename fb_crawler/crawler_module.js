const LOG_FEEDS = false;
const module_dir = __dirname;
const tokenFilename = `${module_dir}/token.json`;

const nodemailer = require("nodemailer");
const email = require("./email.js");

var fs = require('fs');
const https = require('https');

var tokenFile = fs.readFileSync(tokenFilename);
var TOKEN = JSON.parse(tokenFile);
const postLimit = 40;

const graphUrl = `https://graph.facebook.com/${TOKEN['GROUP_ID']}/feed?fields=id,created_time,message,description,picture&limit=${postLimit}&&access_token=${TOKEN['ACCESS_TOKEN']};`

var transporter = nodemailer.createTransport({
  service : 'gmail',
  auth: {
    user: `${email.server.account}`,
    pass: `${email.server.password}`
  }
});
function checkContent(content){
  if(content["error"]){
    const msg = JSON.stringify(content);
    sendErr(msg);
  }
}
function sendErr(message){
  const subject = "Crawler Error, at " + new Date();
  var mailOptions = {
    from: `${email.server.account}`,
    to: `${email.receiver.account}`,
    subject: subject,
    text: message
  };
  console.log("Crawler error, sending error messenge:");
  console.log(message);
  transporter.sendMail(mailOptions,function(error,info){
    if (error)
      console.log(error);
    else 
      console.log('Crawler error:' + info.response);
  });
}
var crawler = {
  /* Filter bad feeds */
  isExist: function isExist(obj){
    return obj?true:false;
  },

  /* Scratch feeds from FB group */
  /* With the following format:
   * startTime: mm/dd/yyyy 
   * endTime:   mm/dd/yyyy */
  loadFeedsByTime: function loadFeedsByTime(startTime, endTime, callback) {
    const url = `https://graph.facebook.com/${TOKEN['GROUP_ID']}/feed?fields=id,updated_time,message,description,picture&since(${startTime})&limit=80&until(${endTime})&&access_token=${TOKEN['ACCESS_TOKEN']};`
    https.get(url, (res)=>{                      // FB API need https protocal
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

  /* Scratch feeds from FB group */
  loadFeeds: function loadFeeds(callback) {
    https.get(graphUrl, (res)=>{                      // FB API need https protocal
      //console.log('statusCode: ', res.statusCode);
      //console.log('header: ', res.headers);           
      var body = '';
      res.on('data', (chunk)=>{                       // data will be departed with serveral parts
        body += chunk; });                            // So we need to assemble them manually
      res.on('end', ()=>{                             // Last part
        var content = JSON.parse(body);
        checkContent(content);
        if(LOG_FEEDS)
          console.log('JSON content=', content);
        console.log('Departing feeds...');
        callback(this.departFeeds(content));           // Use departFeeds to filter usable feeds
      });
    })
  },
  
  /* Filter usable feeds by checking message object exist */
  departFeeds: function departFeeds(feeds){
    var usableFeeds = {};
    for(var item in feeds.data){
      if(this.isExist(feeds.data[item].message)){
        var id = feeds.data[item].id;
        var updated_time = feeds.data[item].created_time;
        var message = feeds.data[item].message;
        var picUrl = feeds.data[item].picture;
        if(LOG_FEEDS){
          console.log(`item ${item}=========================================================================================`);
          console.log(`    id= ${id}`);
          console.log(`    time= ${updated_time}`);
          console.log(`    msg= ${message}`);
          console.log(`    pic= ${picUrl}`); 
        }
        usableFeeds[item] = feeds.data[item];
        var timeObj = new Date(updated_time);
        usableFeeds[item].updated_time = timeObj.getTime()/1000;
      }
    }
    return Object.values(usableFeeds);
  }
}

module.exports = crawler;
