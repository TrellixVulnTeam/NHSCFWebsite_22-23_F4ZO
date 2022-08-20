var express = require("express");
var multer = require("multer");

var router = express.Router();

var json2csv = require('json2csv');
var User = require("../../../models/user");
var School = require("../../../models/school");
var delay = require("delay");
var nodemailer = require("nodemailer");
var UploadedNewsletter = require("../../../models/uploadedNewsletter");


router.post("/sendIndEmails", async function(req, res, next){
    var message = req.body.message;
    message = message.replace(/\n/g, "<br>");
    var subject = req.body.subject;
    var userList = await User.find({}, (err, userList) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            console.log("in userList else");
        }
    });
    userList.forEach(async function(user) {
        await delay(5000);
        var uMessage = message;
        uMessage = uMessage.replace(/cmmname/g, user.fname);
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'nhsclimateforum@gmail.com',
                pass: 'abnoviello23'
                }
        });
      
        var mailOptions = {
            from: "Andrew Noviello " + '<nhsclimateforum@gmail.com>',
            to: user.prefEmail,
            subject: subject,
            html: uMessage
        };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });
    res.redirect("/dashboard");
  });