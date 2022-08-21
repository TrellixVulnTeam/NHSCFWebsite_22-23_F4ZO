const emailUtil = require("../util/email");

var express = require("express");
var passport = require("passport");
var router = express.Router();
var randtoken = require("rand-token");
var User = require("../../models/user");
var School = require("../../models/school");

var adminEmails = require("../../params/params").adminEmails;
var privateKey = require("../../params/params").privateKey;

//Route to render Sign-Up page form
router.get("/signup", async function(req,res){
    await School.find({}, function(err, school){
    if(err){
        res.status(500).send('Error', err);
        res.render("form/signup", {schools: school, errorMsg: "Sorry! Failed to load schools list."})
    }
    else{
        res.render("form/signup", {schools: school, errorMsg: req.flash("errorMessage")});
    }
    });
});

//Route to register/sign-up a new user with the database
router.post("/signup", function(req,res, next){
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var grade = req.body.grade;
    var phone = req.body.prefPhoneNum;
    var password = req.body.password;
    var school = req.body.school;
    var adminStatus = false;
    var adminEmailArrayLength = adminEmails.length;
    for(var i = 0; i < adminEmailArrayLength; i++){
        if(email == adminEmails[i]){
            adminStatus = true;
        }
    }

    console.log(school);
    User.findOne({email: email}, function(err, user){
        if(err){
            console.log("In Error");
            return next(err);
        }
        if(user){
            req.flash("errorMessage", "Sorry! Account With This Email Already Exists.");
            console.log("In User Exists");
            return res.redirect("/signup");
        }
        
        if(!req.body.key){ 
            req.flash("errorMessage", "Please enter the private key.");
            console.log("Missing Private Key");
            return res.redirect("/signup");
        }
        
        if(req.body.key != privateKey){
            req.flash("errorMessage", "Please enter the correct private key.");
            console.log("Wrong Private Key");
            return res.redirect("/signup");
        }

        if(fname == null || lname == null || email == null || grade == null || school == null){   
            console.log("Missing fields");         
            req.flash("errorMessage", "Missing required fields! Please complete the entire form.");
            return res.redirect("/signup");
        }
        var newUser = new User({
            fname:fname,
            lname:lname,
            grade:grade,
            email:email,
            phone: phone,
            password:password,
            schoolName:school,
            admin:adminStatus,
            token:randtoken.generate(20)
        });

        newUser.save(next);
        
        var subj = "Welcome to the National High School Forum!";
        var msg = "Dear " + fname + "<br>We are so excited to welcome you into the National High School Climate Forum community! Now, you will be able to access your committee member dashboard, view private events, and engage with other high school environmental leaders across the country!<br><br>The National High School Climate Forum";
        emailUtil.sendDirectEmail(email, subj, msg);
    });
}, passport.authenticate("login", {
    successRedirect:"/dashboard",
    failureRedirect:"/signup",
    failureFlash:true
}));


module.exports = router;