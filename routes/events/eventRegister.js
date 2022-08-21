const emailUtil = require("../util/email");

var express = require("express");
var router = express.Router();

var eventEmail = require("../../params/params").eventRegisterEmailTemplate;
var nodemailer = require("nodemailer");
var Event = require('../../models/event');

router.post('/eventRegister', async function(req, res, next) {
    var bodyReq = req.body;
    var eventName = req.body.curEventName;
    console.log(eventName);
    var eventDateTime = req.body.curEventDate;
    delete bodyReq["curEventName"];
    delete bodyReq["curEventDate"];
    var currentPerson = Object.values(bodyReq);
    let reg = await Event.findOneAndUpdate(
        {eventName: eventName},
        {$push: {registered: [currentPerson]}},
        {upsert: true, new: true});

    var curEventEmail = eventEmail;
    var personName = req.body.attendeeName;
    var schoolName = req.body.attendeeSchool;
    var personEmail = req.body.attendeeEmail;
    console.log(personEmail);
    curEventEmail = curEventEmail.replace(/ATTENDEE/g, personName);
    curEventEmail = curEventEmail.replace(/EVENTNAME/g, eventName);
    curEventEmail = curEventEmail.replace(/EVENTDATE/g, eventDateTime);
    curEventEmail = curEventEmail.replace(/SCHOOLNAME/g, schoolName);
    var emailMessage = curEventEmail;
    
    var emailSubject = "Thank you for Registering for " + eventName;

    emailUtil.sendDirectEmail(personEmail, emailSubject, emailMessage);
    
    res.redirect('/events');
});

module.exports = router;