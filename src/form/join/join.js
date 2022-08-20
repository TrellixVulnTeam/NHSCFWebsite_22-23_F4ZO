var express = require("express");
var passport = require("passport");

var router = express.Router();

var passport = require("passport");
var School = require("../../../models/school");


router.get("/join", function(req, res){
    res.render("pages/signup_forms/join", { errorMsg: req.flash("error") });
});

//Route to add a new school to the database
router.post("/join", function(req,res,next){
    var schoolName = req.body.newSchoolName;
    var newClub = req.body.newSchoolClubName;
    var state = req.body.newSchoolState;
    var facName = req.body.newSchoolFacAdvName;
    var facEmail = req.body.newSchoolFacAdvEmail;
    var socialMedia = req.body.newSchoolClubSM;
    var rep = req.body.recRep;
    
    School.findOne({schoolName:schoolName}, function(err, school){
        if(err){return next(err);}
        if(school){
            req.flash("error", "Your School is Already In the National High School Climate Forum.");
            return res.redirect("./join");
        }
        console.log(schoolName);
        console.log(newClub);
        if(schoolName == null || newClub == null || state == null){
            req.flash("error", "Missing Fields! Please complete the entire form.");
            return res.redirect("./join");
        }
        var newSchool = new School({
            schoolName:schoolName,
            clubName:newClub,
            clubFacAdvName:facName,
            clubFacAdvEmail:facEmail,
            state:state,
            primSocMedia:socialMedia
        });
        newSchool.save(next);
        var repsList = ['AN', 'EP', 'JM', 'IM'];
        var links = ["https://calendly.com/acnoviello23/nhscf", "https://calendly.com/elise-picard/national-high-school-climate-forum-welcome-meeting", "https://calendly.com/jason_ma/national-high-school-climate-forum-welcome-meeting", "https://calendly.com/isabelle-miller-/national-high-school-climate-forum-welcome-meeting"];
        
        res.redirect(links[repsList.indexOf(rep)]);
    });
});


module.exports = router;