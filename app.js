var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var cookieParser = require("cookie-parser");
var passport = require("passport");
var session = require("express-session");
var flash = require("connect-flash");
var params = require("./params/params");
var bodyParser = require("body-parser");
var setUpPassport = require("./setuppassport");
var fs = require('fs');
//var routes = require("./routes");

var app = express();
mongoose.connect(params.DEVDBCONN, {useUnifiedTopology:true, useNewUrlParser:true, useCreateIndex:true});
//mongoose.connect(params.DATABASECONNECTION, {useUnifiedTopology:true, useNewUrlParser:true, useCreateIndex:true});
setUpPassport();

app.set("port", process.env.PORT || 3001);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use('/public', express.static('public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use(cookieParser());
app.use(session({
    secret:"vufyohcohqpwqdwd",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use("/", require("./routes"));

app.use("/css", express.static(__dirname + './views/css'));

app.listen(app.get("port"), function(){
    console.log("Server started at port " + app.get("port"));
});

