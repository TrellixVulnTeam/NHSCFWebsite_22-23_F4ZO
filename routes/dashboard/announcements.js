var express = require("express");
var router = express.Router();


var performance = require('universal-perf-hooks').performance;
var Comment = require("../../models/comment");
var Event = require('../../models/event');
var Post = require('../../models/announcement')

var ensureAuthenticated = require("../../auth/auth").ensureAuthenticated;


router.get("/dashboard", ensureAuthenticated, async function(req, res){
    var comments;
    comments = await Comment.find({active:true}).lean();

    var activeEvents;
    activeEvents = await Event.find({active:true}, {"eventDate":0,"eventDesc":0, "numEventFields":0, "speakers":0, "registered":0, "eventFields":0, "img":0}).lean();

    var activePosts;
    activePosts = await Post.find({commentable:true}).lean();

    res.render('dashboard/dashboard', { activePosts:activePosts, comments:comments, activeEvents:activeEvents });        
});

module.exports = router;
