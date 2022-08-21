var express = require("express");
var multer = require("multer");

var router = express.Router();

var json2csv = require('json2csv');
var User = require("../../models/user");
var School = require("../../models/school");

//Download full delegate roster with all information
router.get("/downloadFullDelegateRoster", async function(req, res, next){
  var userData = [];
  await User.find().then(docs => {
    docs.forEach(function(doc){
      userData.push({
        "fname": doc.fname,
        "lname" : doc.lname,
        "grade" : doc.grade,
        "email": doc.email,
        "phone" : doc.phone,
        "school" : doc.schoolName
      });
  });
  });
  
  res.setHeader('Content-disposition', 'attachment; filename=delegateRoster.csv');
  res.set('Content-Type', 'text/csv');
  var csv = json2csv.parse(userData);
  res.status(200);
  return res.send(csv);
});

//Download full list of NHSCF schools with all information
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
        "socMedia" : doc.socMedia
      });
  });
  });
  
  res.setHeader('Content-disposition', 'attachment; filename=schoolList.csv');
  res.set('Content-Type', 'text/csv');
  var csv = json2csv.parse(schoolData);
  res.status(200);
  return res.send(csv);
});

module.exports = router;