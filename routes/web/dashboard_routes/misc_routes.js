var express = require("express");
var multer = require("multer");

var router = express.Router();

var json2csv = require('json2csv');
var User = require("../../../models/user");
var School = require("../../../models/school");
var delay = require("delay");
var nodemailer = require("nodemailer");
var UploadedNewsletter = require("../../../models/uploadedNewsletter");

var newsletterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/NewsletterUploads');
  },
  filename: (req, file, cb) => {
      
      if (file.originalname.match(/\.(pdf)$/)){
          cb(null, req.body.newsletterMonth + req.body.newsletterYear + "Newsletter.pdf");
      }
      if(file.originalname.match(/\.(pdf|jpg|JPG|jpeg|JPEG|png|PNG)$/)){
          cb(null, req.body.newsletterMonth + req.body.newsletterYear + "CoverImage.jpg");
      }
  }
});

var NewsletterUpload = multer({storage: newsletterStorage});

router.post("/changeComm", async function(req, res, next){
    console.log(req.user.prefEmail);
    console.log(req.body.newComm);
    console.log("In ChangeComm");
    let doc = await User.findOneAndUpdate({prefEmail:req.user.prefEmail}, {committee:req.body.newComm}, {
        new: true
      });

    res.redirect("/dashboard");
});

router.get("/downloadFullDelegateRoster", async function(req, res, next){
  var userData = [];
  await User.find().then(docs => {
    docs.forEach(function(doc){
      userData.push({
        "fname": doc.fname,
        "lname" : doc.lname,
        "grade" : doc.grade,
        "email": doc.prefEmail,
        "phone" : doc.prefPhoneNum,
        "school" : doc.schoolName
      });
  });
  });
  
  console.log("User Data: ", userData)
  res.setHeader('Content-disposition', 'attachment; filename=delegateRoster.csv');
  res.set('Content-Type', 'text/csv');
  var csv = json2csv.parse(userData);
  console.log("Completed parsing - prepping send");
  res.status(200);
  return res.send(csv);
});

router.get("/downloadFullSchoolList", async function(req, res, next){
  var schoolData = [];
  await School.find().then(docs => {
    docs.forEach(function(doc){
      schoolData.push({
        "school" : doc.schoolName,
        "state" : doc.state
      });
  });
  });
  
  res.setHeader('Content-disposition', 'attachment; filename=schoolList.csv');
  res.set('Content-Type', 'text/csv');
  var csv = json2csv.parse(schoolData);
  console.log("Completed parsing - prepping send");
  res.status(200);
  return res.send(csv);
});

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

router.post("/uploadNewsletter", NewsletterUpload.fields([{name: 'newsletter', maxCount: 1}, {name: 'image', maxCount: 1}]), (req, res, next) => {
  console.log(req.body);

  var obj = {
      newsletterMonth: req.body.newsletterMonth,
      newsletterYear: req.body.newsletterYear,
      releaseDate: req.body.releaseDate,
      newsletterPDFFileName: req.body.newsletterMonth + req.body.newsletterYear + "Newsletter.pdf",
      newsletterImgFileName: req.body.newsletterMonth + req.body.newsletterYear + "CoverImage.jpg"
  }

  UploadedNewsletter.create(obj, (err, item) => {
      if (err) {
          console.log(err);
      }
      else {
          res.redirect('/newsletters');
      }
  });
});

module.exports = router;