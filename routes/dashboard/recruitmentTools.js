const emailUtil = require("../util/email");

var express = require("express");
var multer = require("multer");

var router = express.Router();

var express = require("express");
var router = express.Router();
var School = require("../../models/school");
var delay = require("delay");
var fs = require("fs");
var recruitEmail = require("../../params/params").recruitmentEmailTemplate;

//Stores all CSVs in the application bin (essentially junk folder)
var csvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/data/bin');
    },
    filename: (req, file, cb) => {
        
        if (file.originalname.match(/\.(csv)$/)){
            curCSVFileName = file.originalname;
            cb(null, file.originalname);
        }
        
    }
});

var csvUpload = multer({storage: csvStorage});

router.post("/csvUpload", csvUpload.single("csvFile"), async function(req,res,next){
    if(curCSVFileName){
        var data = fs.readFileSync("public/data/bin/" + curCSVFileName, "utf8");
        data = data.split("\r\n");
        var firstRow = data[0];
        data.shift();
        var ct;
        for(ct = 0; ct < data.length; ct++){
            data[ct] = data[ct].split(',');
        }
        for(ct = 0; ct < data.length; ct++){
            await delay(5000);
            //Email, Full Name, School Name, Position
            var email = data[ct][0];
            var name = data[ct][1];
            var school = data[ct][2];
            var pos = data[ct][3];
            await School.find().distinct("schoolName", function(err, count){
                totalSchools = count.length;
            });
            await School.find().distinct("state", function(err, count){
                totalStates = count.length;
            });
            var emailMessage = recruitEmail;
            var emailSubject = "Student Club Opportunity: The National High School Climate Forum";
            emailMessage = emailMessage.replace(/contactschool/g, school);
            emailMessage = emailMessage.replace(/contactname/g, name);
            emailMessage = emailMessage.replace(/contactpos/g, pos);
            emailMessage = emailMessage.replace(/cmmname/g, req.user.fname + " " + req.user.lname);
            emailMessage = emailMessage.replace(/cmmschool/g, req.user.schoolName);
            emailMessage = emailMessage.replace(/schoolnum/g, totalSchools);
            emailMessage = emailMessage.replace(/statenum/g, totalStates);
            
            var senderName = req.user.fname + " " + req.user.lname;
            emailUtil.sendDirectRecruitmentEmail(email, req.user.prefEmail, senderName, emailSubject, emailMessage);
        }
    }
    curCSVFileName = null;
    res.redirect("/dashboard");
});

router.post("/emailForm", async function(req, res, next){
    console.log(req.user);
    await School.find().distinct("schoolName", function(err, count){
        totalSchools = count.length;
    });
    await School.find().distinct("state", function(err, count){
        totalStates = count.length;
    });
    var recEmailAddress = req.body.emailAddr;
    var emailMessage = recruitEmail;
    var schoolName = req.body.schoolName;
    var recipient = req.body.recipient;
    var recPosition = req.body.position;
    console.log(totalSchools);
    console.log(totalStates);
    var emailSubject = "Student Club Opportunity: The National High School Climate Forum";
    emailMessage = emailMessage.replace(/contactschool/g, schoolName);
    emailMessage = emailMessage.replace(/contactname/g, recipient);
    emailMessage = emailMessage.replace(/contactpos/g, recPosition);
    emailMessage = emailMessage.replace(/cmmname/g, req.user.fname + " " + req.user.lname);
    emailMessage = emailMessage.replace(/cmmschool/g, req.user.schoolName);
    emailMessage = emailMessage.replace(/schoolnum/g, totalSchools);
    emailMessage = emailMessage.replace(/statenum/g, totalStates);

    var senderName = req.user.fname + " " + req.user.lname;
    emailUtil.sendDirectRecruitmentEmail(recEmailAddress, req.user.prefEmail, senderName, emailSubject, emailMessage);

    res.redirect("/dashboard");
});

module.exports = router;