var express = require("express");
var multer = require("multer");

var router = express.Router();

var User = require("../../models/user");
var params = require("../../params/params");
var nodemailer = require("nodemailer");
var Post = require('../../models/announcement');

//Storage Setup for Post Attachments - storage located in the `bin` folder
var postAttachmentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/data/bin');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

var postAttachmentUpload = multer({storage: postAttachmentStorage});

//Route to add a post to the Announcements Page
router.post("/addPost", postAttachmentUpload.single('fileAttachment'), async function(req, res, next){
    var fullBody = req.body;
    var fullFile = req.file;
    var title = req.body.title;
    var content = req.body.content;
    
    content = content.replace(/\n/g, "<br>");
    console.log(req.body.content);
    var userList = await User.find({}, (err, userList) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
    });
    var recEmailAddress = "";
    userList.forEach(function(user) {
        recEmailAddress = recEmailAddress + "," + user.email;
    });
    console.log(recEmailAddress);
    var newPost = new Post({
        title:title,
        content:content,
        commentable:true
    });
    newPost.save(next);
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: params.SENDER_EMAIL,
            pass: params.SENDER_EMAIL_PASSWORD
            }
    });

    if(fullFile){
        console.log(fullFile.filename);
    var mailOptions = {
        from: 'The National High School Climate Forum <' + params.SENDER_EMAIL + '>',
        to: params.PRIMARY_RECEIVER,
        bcc: recEmailAddress,
        subject: title,
        html: content + "<br><br> Please view on our website at: <br>" + params.baseURL + "/dashboard",
        attachments: [
            {
                filename: fullFile.filename,
                path: __dirname + '/../../public/postAttachments/' + fullFile.filename,
            }
        ]
    };
    console.log("Exited file attachment if - build okay");
    }
    else{
        var mailOptions = {
            from: 'The National High School Climate Forum <' + params.SENDER_EMAIL + '>',
            to: params.PRIMARY_RECEIVER,
            bcc: recEmailAddress,
            subject: title,
            html: content + "<br><br> Please view on our website at: <br>" + params.baseURL + "/dashboard"
        };
    }
  if(req.user.admin == true){
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
    res.redirect("/dashboard");
});

//Route to delete posts shown on the Announcements page
router.post("/deletePost", async function(req, res, next){
    var title = req.body.delposts;
    let doc = await Post.findOneAndUpdate({title:title}, {commentable:false}, {
        new: true
      });
    res.redirect("/dashboard");
});

module.exports = router;