var express = require("express");
var router = express.Router();

var School = require("../../models/school");

router.get("/", async function(req, res){ 
    var totalSchools = 0;
    var totalStates = 0;    
    await School.find().distinct("schoolName", function(err, count){
        totalSchools = count.length;
    });
    await School.find().distinct("state", function(err, count){
        totalStates = count.length;
    });
    
    res.render("home", {totalSchools: totalSchools, totalStates: totalStates});
});

router.get("/home", async function(req, res){ 
    var totalSchools = 0;
    var totalStates = 0;
    await School.find().distinct("schoolName", function(err, count){
        totalSchools = count.length;
    });
    await School.find().distinct("state", function(err, count){
        totalStates = count.length;
    });

    res.render("home", {totalSchools: totalSchools, totalStates: totalStates});
});

router.get("/logout", function(req,res){
    req.logout();
    res.redirect("/home");
});

module.exports = router;