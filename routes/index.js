var express = require("express");

var router = express.Router();

router.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.info = req.flash("info");
    next();
});

router.use("/", require("./admin/manageNewsletter"));
router.use("/", require("./admin/manageEvents"));
router.use("/", require("./admin/manageDownloads"));
router.use("/", require("./admin/managePosts"));
router.use("/", require("./admin/sendEmails"));

router.use("/", require("./dashboard/announcements"));
router.use("/", require("./dashboard/recruitmentTools"));

router.use("/", require("./events/displayEvents"));
router.use("/", require("./events/eventRegister"));

router.use("/", require("./form/join"));
router.use("/", require("./form/login"));
router.use("/", require("./form/signup"));
router.use("/", require("./form/managePasswords"));

router.use("/", require("./newsletter/newsletters"));

router.use("/", require("./other/mainRoutes"));


module.exports = router;