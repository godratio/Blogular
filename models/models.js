var mongoose = require('mongoose');

var blogSchema = mongoose.Schema({
    title: String,
    author: String,
    text: String,
    reversed: {type: Boolean, default: false},
    comments: [
        { body: String, date: Date, username: String }
    ],
    date: { type: Date, default: Date.now },
    updateDate:{type:Date,default:Date.now},
    hidden: Boolean,
    meta: {
        votes: Number,
        favs: Number
    },
    titleImage: String,
    categories: [
        {name: String}
    ]
});
var userSchema = mongoose.Schema({
    username: String,
    password: String,
    admin:String,
    email: String
});
var updateSchema = mongoose.Schema({
    lastUpdate: {type: Date, default: Date.now()}
});
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("connected");
});
var Blog = mongoose.model('Blog', blogSchema);
var User = mongoose.model('User', userSchema);
var Update = mongoose.model('Update', updateSchema);

module.exports = {
    Blog: Blog,
    User:User,
    Update:Update
}