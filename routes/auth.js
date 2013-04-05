var models = require('../models/models');
var Blog = models.Blog;
var User = models.User;
var Update = models.Update;

exports.checkAuthed = function (req, res) {
    User.find({_id:req.session.passport.user},function(err,user){
        if(err)console.log(err);
        console.log(user[0].username);
        //noinspection MagicNumberJS
        return res.send(user[0].username, 200);
    })
};


//update docs route
exports.lastUpdateSame = function (req, res) {
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
};

exports.lastUpdateSameId = function (req, res) {
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

};

exports.logout = function (req, res) {
    req.logout();
    //noinspection MagicNumberJS
    res.send('loggedout', 410);
};

exports.loginAuth =  function (req, res) {
    User.findOne({'username': req.body.username, 'password': req.body.password,admin:{$in:['superuser','admin']}}, function (err, administrator) {
        if (err)console.log(err);
        if (administrator) {
            req.session.loggedIn = true;
        } else {
            req.session.loggedIn = false;
        }

        return res.send(200);
    });

};

exports.register =  function (req, res) {
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


};


