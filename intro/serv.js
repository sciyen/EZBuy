const express = require('express');
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const email = require("./email.js");
var analysis = require("../dataAnalysis/analysis_module");
const app = express();
const port = 23458;

app.listen(port);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

var transporter = nodemailer.createTransport({
  service : 'gmail',
  auth: {
    user: `${email.server.account}`,
    pass: `${email.server.password}`
  }
});


console.log (`listening port:${port} `)
console.log (`email account is ${email.server.account}; password is ${email.server.password}`)
console.log (`receiver is ${email.receiver.account}`)

app.get('/analysis', function(req,res){
  console.log("Get request from client");
  analysis.getPopularItems("Subscribers", (subscribers)=>{
    analysis.getPopularItems("Posts", (posts)=>{
      var data = {
        subscribers: subscribers,
        posts: posts
      }
      res.send(data);
    })
  })
})
app.post('/ajax_data', function(req,res){
  var mailOptions = {
    from: `${email.server.account}`,
    to: `${email.receiver.account}`,
    subject: `EZBuy comment by ${req.body.name}`,
    text: `Email: ${req.body.email} Comment: ${req.body.message}`
  };
  
  transporter.sendMail(mailOptions,function(error,info){
    if (error){
      console.log(error);
    }
    else {
      console.log('Email sent:' + info.response);
    }
  });

//  var data_array = [{"name":`${req.body.name}`,"email":`${req.body.email}`,"message":`${req.body.message}`}];
  res.redirect("/index.html");
});
