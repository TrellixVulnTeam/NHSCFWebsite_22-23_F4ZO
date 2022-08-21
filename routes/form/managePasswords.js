const emailUtil = require("../util/email");

var express = require("express");

var router = express.Router();

var User = require("../../models/user");
var baseURL = require("../../params/params").baseURL;
var nodemailer = require("nodemailer");
var delay = require("delay");

router.get("/forgotPassword", function(req, res, next){
    res.render("form/pswd/forgotPasswordForm");
});

router.post("/sendConfirmEmailPwdChg", async function(req, res, next){
    var user = await User.findOne({email:req.body.email});
    if(user){
        var token = user.token;
        var subj = "NHSCF Website Password Reset";
        var msg = "Please use the following link to change your NHSCF Website password: <br> " + baseURL + "reset-password?token=" + token;
        emailUtil.sendDirectEmail(req.body.email, subj, msg);
    }else{
        console.log("User doesn't exist!");
    }

    res.redirect("/home");
});

router.post("/changePassword", async function(req, res, next){
    if(req.body.pwd == req.body.cpwd){
        let doc = await User.findOne({token:req.body.token});
        doc.password = req.body.pwd;
        doc.save();
    }
    res.redirect("/login");
});

router.get("/reset-password", function(req, res, next){
    res.render("form/pswd/newPasswordForm", { token: req.query.token });
});

module.exports = router;