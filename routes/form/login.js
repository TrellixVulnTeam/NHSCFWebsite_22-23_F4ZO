var express = require("express");
var passport = require("passport");

var router = express.Router();

var User = require("../../models/user");

//Route to render login form for a user
router.get("/login", function(req,res){
    res.render("form/login", { errorMsg: req.flash("errorMessage") });
});

//Route to log a user into the app
router.post("/login", async function(req, res, next){
    var email = req.body.email;
    var user;
    var user = await User.findOne({email: email}, function(err, user){
        if(err){
            req.flash("errorMessage", "Sorry! Error occurred.");
            return next(err);
        }
    });

    console.log("Completed finding of user");
    if(!user){
        console.log("Incorrect log-in credentials!")
        req.flash("errorMessage", "Sorry! Incorrect Username/Password.");
        return res.redirect("/login");
    }

    console.log("Checking passport!");
    next();

}, passport.authenticate("login", {
    successRedirect:"/dashboard",
    failureRedirect:"/login",
    failureMessage: "Sorry! Incorrect Username/Password",
    failureFlash:true,
    passReqToCallback: true
}));


module.exports = router;