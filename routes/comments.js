var models = require('../models/models');
var Blog = models.Blog;
var User = models.User;
var update = models.Update;

exports.comments = function (req) {
    Blog.findOne({_id: req.body.id}, function (err, blog) {
        blog.comments.unshift({body: req.body.body, date: Date.now()});
        blog.save(function (err, blog) {
            if (err)console.log(err);
            var update = new Update();
            update.save(function(err,update){if(err)console.log(err);});
        })
    })
};