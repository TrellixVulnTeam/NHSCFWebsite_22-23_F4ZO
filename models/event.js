var bcrypt = require("bcryptjs");
var mongoose = require("mongoose");

var eventSchema = mongoose.Schema({
    active:{type:Boolean, required:true},
    eventName: {type:String, required:true},
    eventDate: {type:String, required:false},
    eventDesc: {type:String, required:false},
    registered:{type:Array, required:false},
    numEventFields: {type:Number, required:false},
    eventFields: {type:String, required:false},
    isPublic: {type:Boolean, required:true},
    canRegister: {type:Boolean, required:false},
    img:{type:String, required:true},
    flyer:{type:String, required:true}
});

var Event = mongoose.model("Event", eventSchema);

module.exports = Event;