var express = require("express");
var multer = require("multer");

var router = express.Router();

var json2csv = require('json2csv');
var User = require("../../../models/user");
var School = require("../../../models/school");
var delay = require("delay");
var nodemailer = require("nodemailer");
var UploadedNewsletter = require("../../../models/uploadedNewsletter");

var newsletterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'public/data/newsletters');
  },
  filename: (req, file, cb) => {
      
      if (file.originalname.match(/\.(pdf)$/)){
          cb(null, req.body.newsletterMonth + req.body.newsletterYear + "Newsletter.pdf");
      }
      if(file.originalname.match(/\.(pdf|jpg|JPG|jpeg|JPEG|png|PNG)$/)){
          cb(null, req.body.newsletterMonth + req.body.newsletterYear + "CoverImage.jpg");
      }
  }
});

var NewsletterUpload = multer({storage: newsletterStorage});

router.post("/uploadNewsletter", NewsletterUpload.fields([{name: 'newsletter', maxCount: 1}, {name: 'image', maxCount: 1}]), (req, res, next) => {
    console.log(req.body);
  
    var obj = {
        newsletterMonth: req.body.newsletterMonth,
        newsletterYear: req.body.newsletterYear,
        releaseDate: req.body.releaseDate,
        newsletterPDFFileName: req.body.newsletterMonth + req.body.newsletterYear + "Newsletter.pdf",
        newsletterImgFileName: req.body.newsletterMonth + req.body.newsletterYear + "CoverImage.jpg"
    }
  
    UploadedNewsletter.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/newsletters');
        }
    });
});
  
module.exports = router;