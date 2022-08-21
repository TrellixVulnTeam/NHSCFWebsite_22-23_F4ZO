var express = require("express");
var nodemailer = require("nodemailer");
var params = require("../../params/params");

async function sendGenericEmail(emails, subj, msg){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
                user: params.SENDER_EMAIL,
                pass: params.SENDER_EMAIL_PASSWORD
            }
    });
  
    var mailOptions = {
        from: 'The National High School Climate Forum <' + params.SENDER_EMAIL + '>',
        to: params.PRIMARY_RECEIVER,
        bcc: bccEmails,
        subject: subj,
        html: msg
    };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

async function sendDirectEmail(toAddr, subj, msg){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
                user: params.SENDER_EMAIL,
                pass: params.SENDER_EMAIL_PASSWORD
            }
    });
  
    var mailOptions = {
        from: 'The National High School Climate Forum <' + params.SENDER_EMAIL + '>',
        to: params.toAddr,
        cc: params.PRIMARY_RECEIVER,
        subject: subj,
        html: msg
    };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

async function sendDirectRecruitmentEmail(toAddr, senderEmail, senderName, subj, msg){
  var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
              user: params.SENDER_EMAIL,
              pass: params.SENDER_EMAIL_PASSWORD
          }
  });

  var mailOptions = {
      from: senderName +' <' + params.SENDER_EMAIL + '>',
      to: params.toAddr,
      cc: [senderEmail, "acnoviello23@lawrenceville.org", params.SENDER_EMAIL],
      subject: subj,
      html: msg
  };

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}

async function sendGenericEmailWithAttachments(emails, subj, msg, fullFile){
  var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
              user: params.SENDER_EMAIL,
              pass: params.SENDER_EMAIL_PASSWORD
          }
  });

  var mailOptions = {
      from: 'The National High School Climate Forum <' + params.SENDER_EMAIL + '>',
      to: params.PRIMARY_RECEIVER,
      bcc: emails,
      subject: subj,
      html: msg,
      attachments: [
        {
            filename: fullFile.filename,
            path: __dirname + '/../../public/data/bin/' + fullFile.filename,
        }
    ]
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = { sendGenericEmail, sendDirectEmail, sendGenericEmailWithAttachments, sendDirectRecruitmentEmail };
