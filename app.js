Object.clone = function (obj) {
    return Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyNames(obj).reduce(function (memo, name) {
        return (memo[name] = Object.getOwnPropertyDescriptor(obj, name)) && memo;
    }, {}));
}
//noinspection JSUnresolvedVariable

var express = require('express')
    , http = require('http')
    //routes
    , blogRoutes = require('./routes/blog')
    , authRoutes = require('./routes/auth')
    , commentRoutes = require('./routes/comments')
    , fileHandlerRoutes = require('./routes/fileHandler')
    , path = require('path')
    , fs = require('fs')
    , cookie = require('cookie')
    , passportSocketIo = require("passport.socketio")
    , MemoryStore = express.session.MemoryStore
    , sessionStore = new MemoryStore()
    , q = require('q')
    //models
    , blogModels = require('./models/models')
    , passport = require('./auth/local').passport_local;

//set up database models to mongoose
var Blog = blogModels.Blog;
var User = blogModels.User;
var Update = blogModels.Update;

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

//Blog Routes
app.get('/blog', blogRoutes.allBlogs);

app.get('/blog/:id', blogRoutes.getABlog);

app.get('/blogLastUpdate/:id',blogRoutes.getLastBlogUpdateDate());

app.post('/blog', passport.ensureAuthenticated, blogRoutes.createBlog);
//edit
app.post('/blog/:id', passport.ensureAuthenticated, blogRoutes.updateBlog);



app.delete('/blog/:id', passport.ensureAuthenticated, blogRoutes.deleteBlog);

app.post('/addBlogPost', passport.ensureAuthenticated, blogRoutes.addBlogEntry);
//Auth Routes

app.get('/checkauthed', passport.ensureAuthenticated, authRoutes.checkAuthed);

//Update docs routes
app.get('/lastUpdateSame', authRoutes.lastUpdateSame);

app.get('/lastUpdateSame/:date', authRoutes.lastUpdateSameId);

//Logging in and Registration routes

app.post('/logout', authRoutes.logout);

app.post('/login',
    passport.authenticate('local'),
    function (req, res) {
        res.send('authed', 200);
    });

app.post('/auth/login',authRoutes.loginAuth);

app.get('username',passport.ensureAuthenticated,function(req,res){
    req.send(req.session.username,200);
});

app.post('/register',authRoutes.register);

//comment system routes


app.post('/comments', passport.ensureAuthenticated, commentRoutes.comments);

//file handler routes

app.post('/upload', passport.ensureAuthenticated, fileHandlerRoutes.upload);



var server = http.createServer(app).listen(app.get('port'), function () {
    console.log("server listening " + app.get('port'));
});
var io = require('socket.io').listen(server);

//************SOCKET.IO**************************//
// TODO:fix chat bug where same user name of user shows twice.

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
