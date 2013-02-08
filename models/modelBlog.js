var mongoose = require('mongoose');
var blogSchema = mongoose.Schema({
    title:  String,
    author: String,
    text:   String,
    comments: [{ body: String, date: Date }],
    date: { type: Date, default: Date.now },
    hidden: Boolean,
    meta: {
        votes: Number,
        favs:  Number
    }
});
console.log("add model");
var Blog = mongoose.model('Blog', blogSchema);

module.exports = {
    Blog: Blog
}