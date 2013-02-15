var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
    ,mongoose = require('mongoose')
    ,fs = require('fs');
//var MemoryStore = require('connect/middleware/session/memory');
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

var adminSchema = mongoose.Schema({
    username:String,
    password:String
});

var Blog = mongoose.model('Blog', blogSchema);
var Admin = mongoose.model('Admin',adminSchema);

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
   /*
    app.use(express.bodyDecoder());
    app.use(express.cookieDecoder());
    app.use(express.session({ store: new MemoryStore({ reapInterval: 60000 * 10 }) }));
*/
});
function restrict(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.send('authentication failed',401);
    }
}
app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/blog', function (req, res) {
    var blogposts = Blog.find().lean().exec(function (err, posts) {
        return res.end(JSON.stringify(posts));
    });

});

app.get('/blog/:id', function (req, res) {
    var id = req.params.id;
    var blogPost = Blog.find({'_id':id}).lean().exec(function (err, post) {
        return res.end(JSON.stringify(post));
    })
});

app.post('/auth/login', function (req, res) {
    /*
     var userEntry = new Admin({username:'ray',password:'abc'});
     userEntry.save(function(err,userEntry){
     if(err)console.log(err);
     })
     */
    console.log(req.body);
    var admin = Admin.findOne({'username':req.body.username, 'password':req.body.password}, function (err, administrator) {
        if (err)console.log(err);
        console.log(administrator);
        if (administrator) {
            console.log("logged in");
            req.session.loggedIn = true;
        } else {
            console.log("not in");
            req.session.loggedIn = false;
        }

        return res.send(200);
    });

});

app.post('/blog', restrict, function (req, res) {
    //console.log(req.session.loggedIn);
    console.log(req.body);
    var title = req.body.title;
    if (title === '' || title === null || title === undefined)return res.send('need a title', 404);
    else {
        var newBlogEntry = new Blog(req.body);
        newBlogEntry.save(function (err, newBlogEntry) {
            if (err)console.log(err);
        });
        return res.end(JSON.stringify({'success':'true'}));
    }
});

app.post('/blog/:id', restrict, function (req, res) {
    delete req.body._id;
    Blog.findOneAndUpdate({'_id':req.params.id}, req.body, function (err, doc) {
        if (err)
            console.log(err);
    });
});

app.post('/addBlogPost', restrict, function (req, res) {
    var newBlogEntry = new Blog(req.body);
    newBlogEntry.save(function (err, newBlogEntry) {
        if (err)console.log(err);
        console.log(req.body);
    });
    return res.end(JSON.stringify({'success':'true'}));
});

app.post('/upload', restrict, function (req, res) {
    var name = req.files.userPhoto.name;
    fs.readFile(req.files.userPhoto.path, function (err, data) {
        var newPath = __dirname + "/public/uploads/" + name;
        fs.writeFile(newPath, data, function (err) {
            res.redirect("back");
        });
    });
});

app.delete('/blog/:id', restrict, function (req, res) {
    console.log('deleted' + req.params.id);
    Blog.remove({'_id':req.params.id}, function (err, doc) {
        if (err)
            console.log(err);
    });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
