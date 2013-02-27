var express = require('express')
    ,http = require('http')
    , routes = require('./routes')
    , user = require('./routes/user')
    , path = require('path')
    , mongoose = require('mongoose')
    , fs = require('fs')
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    ,cookie = require('cookie')
    ,passportSocketIo = require("passport.socketio")
    ,MemoryStore = express.session.MemoryStore
    ,sessionStore = new MemoryStore();
//var MemoryStore = require('connect/middleware/session/memory');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    // yay!
    console.log("connected");
});

var blogSchema = mongoose.Schema({
    title:String,
    author:String,
    text:String,
    comments:[
        { body:String, date:Date ,username:String }
    ],
    date:{ type:Date, default:Date.now },
    hidden:Boolean,
    meta:{
        votes:Number,
        favs:Number
    },
    titleImage:String,
    categories:[
        {name:String}
    ]
});
var userSchema = mongoose.Schema({
    username:String,
    password:String,
    email:String
});
var adminSchema = mongoose.Schema({
    username:String,
    password:String
});
var updateSchema = mongoose.Schema({
    lastUpdate:{type:Date, default:Date.now()}
});


var Blog = mongoose.model('Blog', blogSchema);
var User = mongoose.model('User',userSchema);
var Admin = mongoose.model('Admin', adminSchema);
var Update = mongoose.model('Update', updateSchema);

var app = express();
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('secret'));
    app.use(express.session({store:sessionStore,secret:'secret',key:'express.sid'}));
    // Initialize Passport! Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(require('less-middleware')({ src:__dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));

    /*
     app.use(express.bodyDecoder());
     app.use(express.cookieDecoder());
     app.use(express.session({ store: new MemoryStore({ reapInterval: 60000 * 10 }) }));
     */

});

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.find({_id:id},function(err,user){
        done(err,user);
    });
    /*
    findById(id, function (err, user) {
        done(err, user);
    });
    */
});

// Use the LocalStrategy within Passport.
// Strategies in passport require a `verify` function, which accept
// credentials (in this case, a username and password), and invoke a callback
// with a user object. In the real world, this would query a database;
// however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if(password == user.password){
            return done(null,user);
        }else{
            return done(null, false, { message: 'Invalid password' });
        }
        /*
        user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });
        */
    });
}));




// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected. If
// the request is authenticated (typically via a persistent login session),
// the request will proceed. Otherwise, the user will be redirected to the
// login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {return next(); }
    res.send('authfail',401);
}

function checkForAdmin() {
    var admins = Admin.count({username:'ray'}, function (err, count) {
        if (count < 1) {
            var admin = new Admin({username:'ray', password:'abc'}).
                save(function (err) {
                    if (err)console.log(err);
                });
        }
    });}

function devCleanDb(){
    Blog.find({},function(err,blogs){
        for(var i = 0;i<blogs.length;i++){
            if(blogs[i].categories == null){
                blogs[i].remove();
            }
        }
    });

}

function restrict(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.send('authentication failed', 401);
    }
}
devCleanDb();
checkForAdmin();

app.configure('development', function () {
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

app.get('/lastUpdateSame',function(req,res){
    Update.findOne({}).lean().exec(function(err,update){
        var returnResult = [];
        if(err)console.log(err);
        console.log(update);
        if(update == null){
            var updateCreate = new Update();
            updateCreate.save(function(err,newUpdate){
                if(err)console.log(err);
                returnResult.push(newUpdate);
                res.end(JSON.stringify(returnResult));
            })
        }else{
            returnResult.push(update);
            res.end(JSON.stringify(returnResult));
        }
    })
});
app.get('/checkauthed',ensureAuthenticated,function(req,res){
    return res.send("authed",200);
});
app.post('/checkauthed',ensureAuthenticated,function(req,res){
    return res.send("authed",200);
});
app.get('/lastUpdateSame/:date', function (req, res) {
    var dateFromClient = req.params.date;
    var response = [];

    var getLastUpdate = Update.findOne({}, function (err, update) {
        var obj = {};
        if (update == null) {
            obj.result = "false";
        } else {
            if (dateFromClient == update.lastUpdate.getTime()) {
                obj.result = "false";
            } else {
                obj.lastUpdate = update.lastUpdate;
                obj.result = "true";
            }
        }
        response.push(obj);
        console.log(response);
        return res.end(JSON.stringify(response));
    });

});
app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
        res.send('authed',200);
    });
app.get('/logout', function(req, res){
    req.logout();
    res.send('Gone',410 );
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
    //console.log(req.body);
    console.log("blog route");
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
//temp removing restrictions for testing purposes TODO:reinstate restrictions
app.post('/blog/:id',ensureAuthenticated, function (req, res) {
    delete req.body._id;
    User.findOne({_id:req.session.passport.user},function(err,user){
        loggedInUser = user;
        console.log(loggedInUser);
        Blog.findOneAndUpdate({'_id':req.params.id}, req.body, function (err, doc) {
            if (err){
                console.log(err);
                res.end(JSON.stringify({result:'error'}));
            }
           doc.comments[doc.comments.length-1].username = user.username;
            console.log(doc);
            doc.save(function(err,doc){
                if(err)console.log(err);
            });
            res.end(JSON.stringify(doc));
        });
    });

});

app.post('/register',function(req,res){
    var user = new User(req.body);
    user.save(function (err, userT) {
        if (err)console.log(err);
        console.log(req.body);
    });
    return res.end(JSON.stringify({'success':'true'}));
});

app.post('/addBlogPost', restrict, function (req, res) {
    var newBlogEntry = new Blog(req.body);
    newBlogEntry.save(function (err, newBlogEntry) {
        if (err)console.log(err);
        console.log(req.body);
    });
    return res.end(JSON.stringify({'success':'true'}));
});

app.post('/comments',ensureAuthenticated ,function(req,res){
    console.log(req.body);
    var newComment = Blog.findOne({_id:req.body.id},function(err,blog){
                    blog.comments.push({body:req.body.body,date:Date.now()});
                    blog.save(function(err,blog){
                        if(err)console.log(err);
                        console.log(blog);
                    })
    })
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

var server = http.createServer(app).listen(app.get('port'),function(){
    console.log("server listening "+app.get('port'));
});
var io = require('socket.io').listen(server);

//************SOCKETS.IO**************************//

io.configure(function (){
    io.set("authorization", passportSocketIo.authorize({
        key:    'express.sid',       //the cookie where express (or connect) stores its session id.
        secret: 'secret', //the session secret to parse the cookie
        store:   sessionStore,     //the session store that express uses
        fail: function(data, accept) {
            // console.log("failed");
            // console.log(data);// *optional* callbacks on success or fail
            accept(null, false);             // second param takes boolean on whether or not to allow handshake
        },
        success: function(data, accept) {
          //  console.log("success socket.io auth");
         //   console.log(data);
            accept(null, true);
        }
    }));
    /*
    io.set('authorization', function (data, accept) {
        if (data.headers.cookie) {
            data.cookie = cookie.parse(data.headers.cookie);
            console.log(data.cookie);
            data.sessionID = data.cookie['express.sid'];
            console.log(data.sessionID);
            // save the session store to the data object
            // (as required by the Session constructor)
            data.sessionStore = sessionStore;
            sessionStore.get(data.sessionID, function (err, session) {
                console.log(session);
                if (err || !session) {
                    accept('Error with getting session from store', false);
                } else {
                    // create a session object, passing data as request and our
                    // just acquired session data
                    console.log("found in store");
                    data.session = new Session(data, session);
                    accept(null, true);
                }
            });
        } else {
            return accept('No cookie transmitted.', false);
        }
       // console.log('socketio authorization called');
       // callback(null, true); // error first callback style
    });
    */
});
var rooms = [];

io.sockets.on('connection' , function(socket){
    socket.emit('connected',{conn:'true'});
    socket.on('subscribe',function(data){
        console.log('subscribed');
        console.log(data);
        console.log(socket.handshake.user);
        socket.join(data.room);
        rooms.push({room:data.room,user:[]})
        passportSocketIo.filterSocketsByUser(io, function (user) {
            console.log(user);
            return user[0]._id === socket.handshake.user[0]._id;
        }).forEach(function(s){
                console.log("for each");
                socket.broadcast.in(data.room).emit('updateusers',{username:socket.handshake.user[0].username,id:socket.handshake.user[0]._id});
            });

    });
    socket.on('sentcomment',function(data){
        socket.broadcast.emit('commentsupdated','',"updateNow");
    });
    socket.on('unsubscribe', function(){
        // remove the username from global usernames list
        //delete usernames[socket.username];
        // update list of users in chat, client-side
        //io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        console.log('unsubscribe');
        console.log(socket.handshake.user);
        passportSocketIo.filterSocketsByUser(io, function (user) {
            console.log(user);
            return user[0]._id === socket.handshake.user[0]._id;
        }).forEach(function(s){
                console.log("for each rem");

                socket.leave(socket.room);
                socket.broadcast.to(socket.room).emit('removeuser',socket.handshake.user[0]._id);
            });

    });
    socket.on('disconnect', function(){
        // remove the username from global usernames list
        //delete usernames[socket.username];
        // update list of users in chat, client-side
        //io.sockets.emit('updateusers', usernames);
        // echo globally that this client has left
        console.log('disconnect');
        passportSocketIo.filterSocketsByUser(io, function (user) {
            console.log(user);
            return user[0]._id === socket.handshake.user[0]._id;
        }).forEach(function(s){
                console.log("for each rem");

                socket.leave(socket.room);
                socket.broadcast.to(socket.room).emit('removeuser',socket.handshake.user[0]._id);
            });

    });
});
//io.sockets.in('room').emit('event_name',data);
