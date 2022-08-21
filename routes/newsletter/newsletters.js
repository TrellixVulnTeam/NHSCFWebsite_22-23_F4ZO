var express = require("express");
var router = express.Router();

var Newsletter = require("../../models/newsletter");

router.get("/newsletters", function(req,res){
    Newsletter.find({}, (err, items) => {
        if (err) {res.status(500).send('An error occurred', err);}
        else {
            items.reverse();
            res.render('newsletter/newsletters', { items: items });
        }
    });
});

module.exports = router;