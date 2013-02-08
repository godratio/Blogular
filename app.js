
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
    ,mongoose = require('mongoose')
    ,fs = require('fs');

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    // yay!
    console.log("connected");
});
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
    },
    titleImage:String
});
console.log("add model");
var Blog = mongoose.model('Blog', blogSchema);




var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.get('/blog',function(req,res){
    var blogposts = Blog.find().lean().exec(function(err,posts){
        console.log("blog");
        return res.end(JSON.stringify(posts))
    });

})

app.get('/blog/:id',function(req,res){
    var id = req.params.id;
    console.log("id : "+id);
    var blogPost = Blog.find({'_id':id}).lean().exec(function(err,post){
        console.log("blogid");
        return res.end(JSON.stringify(post));
    })
})

app.post('/blog',function(req,res){
    console.log("POST A NEW BLOG ENTRY");
    var newBlogEntry = new Blog(req.body);
    newBlogEntry.save(function(err,newBlogEntry){
        if(err)console.log(err);
        console.log(req.body);

    })
    return res.end(JSON.stringify({'success':'true'}));
})

app.post('/blog/:id',function(req,res){
    //var updateBlogEntry = Blog.find({'_id':id});
    console.log("blog ID POST");
        console.log(req.params.id);
        delete req.body._id;
        console.log(req.body);
    Blog.findOneAndUpdate({'_id':req.params.id},req.body,function(err,doc){
        if(err)
            console.log(err);
    });
}
)
app.post('/addBlogPost',function(req,res){
    console.log("got request");
    var newBlogEntry = new Blog(req.body);
    newBlogEntry.save(function(err,newBlogEntry){
        if(err)console.log(err);
        console.log(req.body);

    })
    return res.end(JSON.stringify({'success':'true'}));
})

app.post('/upload',function(req,res){
    console.log(req.files);
    var name = req.files.userPhoto.name;
    fs.readFile(req.files.userPhoto.path, function (err, data) {
        // ...
        var newPath = __dirname + "/public/uploads/"+name;
        fs.writeFile(newPath, data, function (err) {
            res.redirect("back");
        });
    });
})

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
