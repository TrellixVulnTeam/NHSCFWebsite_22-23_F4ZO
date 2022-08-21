var express = require("express");
var router = express.Router();

var Event = require('../../models/event');

router.get('/events', async function(req, res) {
    var items;
    if(req.user){
        items = await Event.find({active:true}, {"registered":0, "speakers":0}).lean();
    }
    else {
        items = await Event.find({ active:true, isPublic : true}, {"registered":0, "speakers":0}).lean();
    }
    items = items.reverse();
    res.render('events/eventList', { items: items });
});

module.exports = router;