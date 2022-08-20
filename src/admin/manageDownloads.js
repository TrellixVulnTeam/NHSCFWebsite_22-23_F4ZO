var express = require("express");
var multer = require("multer");

var router = express.Router();

var json2csv = require('json2csv');
var User = require("../../../models/user");
var School = require("../../../models/school");
var delay = require("delay");
var nodemailer = require("nodemailer");
var UploadedNewsletter = require("../../../models/uploadedNewsletter");


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
        "state" : doc.state,
        "club" : doc.clubName,
        "facAdvName" : doc.clubFacAdvName,
        "facAdvEmail" : doc.clubFacAdvEmail,
        "socMedia" : doc.primSocMedia
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
