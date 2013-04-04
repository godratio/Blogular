var models = require('../models/models');
var Blog = models.Blog;
var User = models.User;
var update = models.Update;
/*
 * GET home page.
 */

exports.allBlogs = function(req, res){
        Blog.find().lean().exec(function (err, posts) {
            return res.end(JSON.stringify(posts));
        });
};

exports.getABlog = function(req,res){
    var id = req.params.id;
    Blog.find({'_id': id}).lean().exec(function (err, post) {
        return res.end(JSON.stringify(post));
    });
}

exports.createBlog = function(req,res){
    var title = req.body.title;
    //noinspection JSValidateTypes
    if (title === '' || title === null || title === undefined)return res.send('need a title', 404);
    else {

        var newBlogEntry = new Blog(req.body);
        newBlogEntry.save(function (err) {
            if (err)console.log(err);
        });
        return res.end(JSON.stringify({'success': 'true'}));
    }
}

exports.updateBlog = function(req,res){
    delete req.body._id;
    User.findOne({username: req.user[0]._doc.username}, function (err, user) {
        loggedInUser = user;
        (loggedInUser);
        if (user === null) {
            res.send('error:not an admin account', 401);
        } else {
            //take the blog and update it with the new comment
            //TODO:Highly ineffecient!!! for the network rework this to only have the comment that needs be updated sent and
            //sorted
            Blog.findOneAndUpdate({'_id': req.params.id}, req.body, function (err, doc) {
                if (err) {
                    console.log(err);
                    res.end(JSON.stringify({result: 'error'}));
                }
                if(doc.comments == undefined || doc.comments.length < 1){
                    //do nothing for now
                }else{
                    doc.comments[0].username = user.username;
                }

                doc.save(function (err, doc) {
                    if (err)console.log(err);
                    res.end(JSON.stringify(doc));
                });
                var update = new Update();
                update.save(function(err,update){if(err)console.log(err);});
            });
        }

    });

}

exports.deleteBlog = function(req,res){
    Blog.remove({'_id': req.params.id}, function (err) {
        if (err)
            console.log(err);
        update.save(function(err,update){if(err)console.log(err);});

    });
}