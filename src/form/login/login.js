var express = require("express");
var passport = require("passport");

var router = express.Router();

var passport = require("passport");
var User = require("../../../models/user");

//Route to render login form for a user
router.get("/login", function(req,res){
    res.render("pages/signup_forms/login");
});

//Route to log a user into the app
router.post("/login", function(req, res, next){
    var email = req.body.email;
    User.findOne({email: email}, function(err, user){
        if(err){
            return next(err);
        }
        if(!user){
            req.flash("error", "Sorry! Incorrect Username/Password.");
            return res.redirect("./login");
        }

        console.log("About to Check Passport");
        next();
    });
}, passport.authenticate("login", {
    successRedirect:"/dashboard",
    failureRedirect:"/login",
    failureFlash:true
}));


module.exports = router;