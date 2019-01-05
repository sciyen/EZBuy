const express = require('express');
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const email = require("./email.js");
const app = express();
const port = 23457;

app.listen(port);
app.use(express.static(__dirname + '/public'));
app.use(bodyParser());

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
