var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('../models/models').User;


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

passport.ensureAuthenticated  = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    //noinspection MagicNumberJS
    res.send('authfail', 401);
}


module.exports = {
    passport_local :passport
}