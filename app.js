Object.clone = function (obj) {
    return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyNames(obj).reduce(function (memo, name) {
        return (memo[name] = Object.getOwnPropertyDescriptor(obj, name)) && memo;
    }, {}));
}
//noinspection JSUnresolvedVariable
var express = require('express')
    , http = require('http')
    , routes = require('./routes')
    , user = require('./routes/user')
    , path = require('path')
    , mongoose = require('mongoose')
    , fs = require('fs')
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , cookie = require('cookie')
    , passportSocketIo = require("passport.socketio")
    , MemoryStore = express.session.MemoryStore
    , sessionStore = new MemoryStore()
    , q = require('q');

mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("connected");
});

//TODO:model definitions need to be moved to seperate files in future.
var blogSchema = mongoose.Schema({
    title: String,
    author: String,
    text: String,
    reversed: {type: Boolean, default: false},
    comments: [
        { body: String, date: Date, username: String }
    ],
    date: { type: Date, default: Date.now },
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
/*
var adminSchema = mongoose.Schema({
    username: String,
    password: String
});
*/
var updateSchema = mongoose.Schema({
    lastUpdate: {type: Date, default: Date.now()}
});


var Blog = mongoose.model('Blog', blogSchema);
var User = mongoose.model('User', userSchema);
//var Admin = mongoose.model('Admin', adminSchema);
var Update = mongoose.model('Update', updateSchema);

var app = express();
//noinspection JSValidateTypes
app.configure(function () {
    //noinspection JSUnresolvedVariable,JSValidateTypes,MagicNumberJS
    app.set('port', process.env.PORT || 3000);
    //noinspection JSUnresolvedVariable
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    //noinspection JSUnresolvedFunction
    app.use(express.favicon());
    app.use(express.logger('dev'));
    //noinspection JSUnresolvedFunction
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('secret'));
    //TODO:Config: make secrete changable in config
    app.use(express.session({store: sessionStore, secret: 'secret', key: 'express.sid'}));
    // Initialize Passport! Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(require('less-middleware')({ src: __dirname + '/public' }));
    app.use(express.static(path.join(__dirname, 'public')));
});

// Passport session setup.
// To support persistent login sessions, Passport needs to be able to
// serialize users into and deserialize users out of the session. Typically,
// this will be as simple as storing the user ID when serializing, and finding
// the user by ID when deserializing.
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.find({_id: id}, function (err, user) {
        if(err)(err);
        done(err, user);
    });
});

// Use the LocalStrategy within Passport.
// Strategies in passport require a `verify` function, which accept
// credentials (in this case, a username and password), and invoke a callback
// with a user object. In the real world, this would query a database;
// however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(function (username, password, done) {
    User.findOne({ username: username }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'Unknown user ' + username });
        }
        if (password == user.password) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Invalid password' });
        }
    });
}));


// Simple route middleware to ensure user is authenticated.
// Use this route middleware on any resource that needs to be protected. If
// the request is authenticated (typically via a persistent login session),
// the request will proceed. Otherwise, the user will be redirected to the
// login page.
//noinspection FunctionWithInconsistentReturnsJS
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    //noinspection MagicNumberJS
    res.send('authfail', 401);
}

//TODO:config: This will be the intial admin user
(function checkForAdmin() {
    var defaultAdminName = 'administrator';
    var usertype = "superuser";
    ('Checking for initial admin user');
    User.count({username: defaultAdminName,admin:usertype}, function (err, count) {
        if (count < 1) {
            ('did not find admin user ... creating...');
            var user = new User({username: defaultAdminName, password: defaultAdminName,admin:usertype}).
                save(function (err) {
                    if (err) {
                        console.log(err);
                        ('error creating initial admin user admin');
                    } else {
                        ('inital admin user created username is '+defaultAdminName+'  password is '+defaultAdminName+'. \n ' +
                            'please change password for username '+defaultAdminName+' a.s.a.p.');
                    }
                });
        }
    });
})();

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/blog', function (req, res) {
    Blog.find().lean().exec(function (err, posts) {
        return res.end(JSON.stringify(posts));
    });

});

app.get('/blog/:id', function (req, res) {
    var id = req.params.id;
    Blog.find({'_id': id}).lean().exec(function (err, post) {
        return res.end(JSON.stringify(post));
    })
});

app.get('/lastUpdateSame', function (req, res) {
    Update.findOne({}).lean().exec(function (err, update) {
        var returnResult = [];
        if (err)(err);
        if (update == null) {
            var updateCreate = new Update();
            updateCreate.save(function (err, newUpdate) {
                if (err)console.log(err);
                returnResult.push(newUpdate);
                res.end(JSON.stringify(returnResult));
            });
        } else {
            returnResult.push(update);
            res.end(JSON.stringify(returnResult));
        }
    })
});

app.get('/checkauthed', ensureAuthenticated, function (req, res) {
    User.find({_id:req.session.passport.user},function(err,user){
        if(err)console.log(err);
        console.log(user[0].username);
        //noinspection MagicNumberJS
        return res.send(user[0].username, 200);
    })
});

app.get('/lastUpdateSame/:date', function (req, res) {
    var dateFromClient = req.params.date;
    var response = [];

    Update.findOne({}, function (err, update) {
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
        return res.end(JSON.stringify(response));
    });

});

app.post('/logout', function (req, res) {
    req.logout();
    //noinspection MagicNumberJS
    res.send('loggedout', 410);
});

app.post('/login',
    passport.authenticate('local'),
    function (req, res) {
        res.send('authed', 200);
    });
//for admin side
app.post('/auth/login', function (req, res) {
    User.findOne({'username': req.body.username, 'password': req.body.password,admin:{$in:['superuser','admin']}}, function (err, administrator) {
        if (err)console.log(err);
        if (administrator) {
            req.session.loggedIn = true;
        } else {
            req.session.loggedIn = false;
        }

        return res.send(200);
    });

});

app.get('username',ensureAuthenticated,function(req,res){
    req.send(req.session.username,200);
});

app.post('/blog', ensureAuthenticated, function (req, res) {
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
});
//edit
app.post('/blog/:id', ensureAuthenticated, function (req, res) {
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

});

app.post('/register', function (req, res) {
    var userCount = 0,
        adminCount = 0,
        username = req.body.username,
        password = req.body.password,
        minUsernameLength = 5,
        maxUsernameLength = 16,
        minPasswordLength = 5,
        maxPasswordLength = 16;

    User.count({username: username}, function (err, count) {
        if (err)console.log(err);
        userCount = count;
        //then get admin count
        User.count({username: username,admin :{$in:['superuser','admin']}} , function (err, count) {
            if (err)console.log(err);
            adminCount = count;
            //then check count
            //TODO:redo this section of code in promises
            //username checks
            if (userCount < 1 && adminCount < 1 && username != undefined && username != "" && username.length > minUsernameLength && username.length < maxUsernameLength &&
                //password checks
                password != undefined && password.length > minPasswordLength && password.length < maxPasswordLength && password != username) {
                var user = new User(req.body);
                user.save(function (err) {
                    if (err)console.log(err);
                });
                return res.end(JSON.stringify({'success': 'true'}));
            } else {
                var errorMessage = "";
                if (password == undefined) {
                    password = "";
                }
                if (username == undefined || username == "") {
                    errorMessage = 'Please enter a username';
                } else if (username.length < minUsernameLength) {
                    errorMessage = 'Username must be longer than ' + minUsernameLength;
                } else if (username.length > maxUsernameLength) {
                    errorMessage = 'Username must be shorter than ' + maxUsernameLength;
                } else if (password.length < minPasswordLength) {
                    errorMessage = 'Password must be longer than ' + minPasswordLength;
                } else if (password.length > maxPasswordLength) {
                    errorMessage = 'Password must be shorter than ' + maxPasswordLength;
                } else if (password == username) {
                    errorMessage = 'Password can not be the same as username';
                }
                if (userCount >= 1 || adminCount >= 1) {
                    errorMessage = 'username already taken';
                }
                if (errorMessage == "") {
                    errorMessage = 'unknown error';
                }
                return res.end(JSON.stringify({'fail': errorMessage}));
            }
        });
    });


});

app.post('/addBlogPost', ensureAuthenticated, function (req, res) {
    var newBlogEntry = new Blog(req.body);
    newBlogEntry.save(function (err) {
        if (err)console.log(err);
    });
    return res.end(JSON.stringify({'success': 'true'}));
});

app.post('/comments', ensureAuthenticated, function (req) {
    Blog.findOne({_id: req.body.id}, function (err, blog) {
        blog.comments.unshift({body: req.body.body, date: Date.now()});
        blog.save(function (err, blog) {
            if (err)console.log(err);
            var update = new Update();
            update.save(function(err,update){if(err)console.log(err);});
        })
    })
});

app.post('/upload', ensureAuthenticated, function (req, res) {
    var name = req.files.userPhoto.name;
    fs.readFile(req.files.userPhoto.path, function (err, data) {
        var newPath = __dirname + "/public/uploads/" + name;
        fs.writeFile(newPath, data, function (err) {
            res.redirect("back");
        });
    });
});

app.delete('/blog/:id', ensureAuthenticated, function (req) {
    ('deleted' + req.params.id);
    Blog.remove({'_id': req.params.id}, function (err) {
        if (err)
            console.log(err);
        update.save(function(err,update){if(err)console.log(err);});

    });
});

var server = http.createServer(app).listen(app.get('port'), function () {
    console.log("server listening " + app.get('port'));
});
var io = require('socket.io').listen(server);

//************SOCKET.IO**************************//

io.configure(function () {
    io.set("authorization", passportSocketIo.authorize({
        key: 'express.sid',       //the cookie where express (or connect) stores its session id.
        secret: 'secret', //the session secret to parse the cookie
        store: sessionStore,     //the session store that express uses
        fail: function (data, accept) {
            accept(null, false);             // second param takes boolean on whether or not to allow handshake
        },
        success: function (data, accept) {
            accept(null, true);
        }
    }));
});
var connectedusers = [];

io.sockets.on('connection', function (socket) {
    socket.emit('connected', {conn: 'true'});
    socket.on('loggedin', function () {
        ('logged in ');
        socket.emit('login');
    });
    socket.on('subscribe', function (data) {
        ('subscribed');

        socket.handshake.room = data.room;
        var duplicateUserForRoom = false;
        var usersForThisRoom = [];
        for (var a = 0; a < connectedusers.length; a++) {
            if (connectedusers[a].id == socket.handshake.user[0]._id && connectedusers[a].room == data.room) {
            }
            if (connectedusers[a].room == data.room) {
                usersForThisRoom.push(connectedusers[a]);
            }
        }
        var clients = io.sockets.clients(data.room);
        for (var i = 0; i < clients.length; i++) {
            console.log("================================================================next client loading....");
        }
        if (duplicateUserForRoom == false) {
            socket.join(data.room);
            connectedusers.push({room: data.room, id: socket.handshake.user[0]._id, username: socket.handshake.user[0].username});

            usersForThisRoom.push({room: data.room, id: socket.handshake.user[0]._id, username: socket.handshake.user[0].username});


            socket.emit('initialuserlist', usersForThisRoom);
            socket.broadcast.in(data.room).emit('updateusers', usersForThisRoom);
        }


    });
    socket.on('sentcomment', function (data) {
        socket.broadcast.in(data.room).emit('commentsupdated', '', "updateNow");
    });
    socket.on('unsubscribe', function (data) {
        console.log('unsubscribe');
        socket.leave(data.room);
        var usersForThisRoom = [];
        var buffer = connectedusers;
        for (var a = 0; a < connectedusers.length; a++) {
            if (connectedusers[a].id == socket.handshake.user[0]._id) {
                buffer.splice(a, 1);
            }
            if (connectedusers[a] != undefined && connectedusers[a].room == data.room) {
                usersForThisRoom.push(connectedusers[a]);
            }
        }
        connectedusers = buffer;
        (io.sockets.manager.rooms);
        var clients = io.sockets.clients(data.room);
        for (var i = 0; i < clients.length; i++) {
            console.log("================================================================next client loading....");
        }
        socket.broadcast.to(data.room).emit('updateusers', usersForThisRoom);
    });
    socket.on('disconnect', function () {
        socket.leave(socket.room);
        var usersForThisRoom = [];
        console.log('disconnect');
        var buffer = connectedusers;
        for (var i = 0; i < connectedusers.length; i++) {
            if (connectedusers[i].id == socket.handshake.user[0]._id) {
                buffer.splice(i, 1);
            }
            if (connectedusers[i] != undefined && connectedusers[i].room == socket.room) {
                usersForThisRoom.push(connectedusers[i]);
            }
        }
        connectedusers = buffer;
        console.log(socket.handshake.user[0].username);
        socket.broadcast.to(socket.room).emit('updateusers', usersForThisRoom);
    });
});
