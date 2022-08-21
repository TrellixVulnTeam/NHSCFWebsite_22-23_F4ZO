const emailUtil = require("../util/email");

var express = require("express");
var multer = require("multer");

var router = express.Router();
var Event = require('../../models/event');
var json2csv = require('json2csv');
var User = require("../../models/user");
var baseURL = require("../../params/params").baseURL;
var nodemailer = require("nodemailer");

//Event Image and Flyer storage - located in separate `data` folder
var eventStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.originalname.match(/\.(pdf)$/)){
            cb(null, 'public/data/events/flyers');
        }
        if(file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)){
            cb(null, 'public/data/events/imgs');
        }
    },
    filename: (req, file, cb) => {
        if (file.originalname.match(/\.(pdf)$/)){
            cb(null, req.body.eventName.replace(/[^a-z0-9]/gi, "") + "_Flyer.pdf");
        }
        if(file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)){
            cb(null, req.body.eventName.replace(/[^a-z0-9]/gi, "") + "_Image.jpg");
        }
    }
  });
  
  var EventUpload = multer({storage: eventStorage});

//Create an event to render in the list, uploading flyer, image, etc.
router.post('/eventCreate', EventUpload.fields([{name: 'flyer', maxCount: 1}, {name: 'image', maxCount: 1}]), (req, res, next) => {
    console.log("Creating event: ", req.file);
    var isPublic = false;
    var desc = req.body.eventDesc;
    desc = desc.replace(/\n/g, "<br>");
    if (req.body.isPublic == "true"){
        isPublic = true;
    }
    var obj = {
        active: true,
        eventName: req.body.eventName,
        eventDate: req.body.eventDate,
        eventDesc: desc,
        numEventFields: req.body.numEventFields,
        eventFields: req.body.eventFields,
        isPublic: isPublic,
        canRegister: true,
        img: req.file.filename,
        flyer: req.file.filename
    }
    Event.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
           
            res.redirect('/events');
        }
    });
});

//Delete event to render on the list
router.post("/delEvent", async function(req, res, next){
    let doc = await Event.findOneAndUpdate({eventName:req.body.delev}, {active:false}, {
        new: true
      });
      res.redirect("/dashboard");
});

//Prevent additional event registrations
router.post("/stopEventRegister", async function(req, res, next){
    let doc = await Event.findOneAndUpdate({eventName:req.body.stopev}, {canRegister:false}, {
        new: true
      });
      res.redirect("/dashboard");
});

//Render the adminEvents page
router.get("/adminEvents", async function(req, res){
    var eventSelected = req.query.adminSelectedEventName;
    var items = await Event.find({eventName: eventSelected}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            console.log(items[0].eventFields);
            var ev = items[0];
            var numAttending = ev.registered.length;
            res.render('events/adminEvents', {eventInfo: ev, attending: numAttending});
        }
    });
    
});

//Send personalized emails to all those signed up for a specific event
router.get("/sendSignedUpEventReminder", async function(req, res){
    var link = baseURL + "/events";
    var nameInd = 0, schoolInd = 2, emailInd = 3;
    var event = await Event.findOne({eventName:req.query.reminderEventName}, function(err, event){
        if(err){
            res.status(500).send('Error', err);
        }
        else{
            console.log("In Here");
        }
    });
    var msg = "Hi __CM_NAME__,<br>Hope you are doing well! This is just a reminder that you signed up for the upcoming " + req.query.reminderEventName + " event. Please be sure to reach out if you cannot attend and see this link for more information: " + link + "<br><br>Thanks and see you soon!<br>Alex Noviello";
    var subj = "NHSCF Event Reminder! " + req.query.reminderEventName

    for(var i = 0; i < event.registered.length; i++){
        var curEmail = event.registered[i][emailInd];
        var curName = event.registered[i][nameInd];
        var curSchool = event.registered[i][schoolInd];
        var curMsg = msg.replace("__CM_NAME__", curName);
        emailUtil.sendDirectEmail(curEmail, subj, curMsg);
    }
    var redirectLink = baseURL + "/adminEvents?adminSelectedEventName=" + req.query.reminderEventName;    
    res.redirect(redirectLink);
});

//Send personalized emails to all delegates not registered for an event
router.get("/sendNotSignedUpEventReminder", async function(req, res){
    var link = baseURL + "/events";
    var emailInd = 3;
    var event = await Event.findOne({eventName:req.query.reminderEventName}, function(err, event){
        if(err){
            res.status(500).send('Error', err);
        }
        else{
            console.log("In Here");
        }
    });
    var regEmails = [];
    var userData = [];
    for(var i = 0; i < event.registered.length; i++){
        regEmails.push(event.registered[i][emailInd]);
    }
    await User.find().then(users => {
        users.forEach(function(user){
            if(!regEmails.includes(user.email)){
                userData.push({
                    email: user.email,
                    name: user.fname
                });
            }
        });
    })

    console.log(emails);
    var msg = "Hi __CM_NAME__,<br>Hope you are doing well! This is a reminder to please register for the upcoming " + req.query.reminderEventName + " event.<br><br>If you are unable to attend, please let me know, but I hope to see you there! Please log into the NHSCF website and visit this link for details: " + link + "<br><br>Thanks!<br>Alex Noviello";
    var subj = "Reminder to Register for Upcoming NHSCF Event! " + req.query.reminderEventName
    for(var i = 0; i < userData.length; i++){
        var curEmail = userData[i]['email'];
        var curName = userData[i]['name'];
        var curMsg = msg.replace("__CM_NAME__", curName);
        emailUtil.sendDirectEmail(curEmail, subj, curMsg);
    }

    var redirectLink = baseURL + "/adminEvents?adminSelectedEventName=" + req.query.reminderEventName;
    res.redirect(redirectLink);
});

//Download data for all event registrants
router.get("/downloadEventData", async function(req, res, next){
    var csvData = [];
    var fnameInd = 0, lnameInd = 1, schoolInd = 2, emailInd = 3;
    let docs = await Event.findOne({eventName: req.query.chosenEventName}).lean();
    for(var ct = 0; ct < docs.registered.length; ct++){
        csvData.push({
        "FNames" : docs.registered[ct][fnameInd],
        "LNames" : docs.registered[ct][lnameInd],
        "Schools" : docs.registered[ct][schoolInd],
        "Emails" : docs.registered[ct][emailInd],
      });
    }
    var csv = json2csv.parse(csvData);
    res.setHeader('Content-disposition', 'attachment; filename=eventData.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);

    res.redirect("/events");
});
  
module.exports = router;