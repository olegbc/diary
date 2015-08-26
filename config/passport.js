// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//var GoogleStrategy = require('passport-google-oauth').Strategy;

//var GOOGLE_CLIENT_ID = "16552490808-pv5haqfls51amaqn2hgfojmltolgue98.apps.googleusercontent.com";
//var GOOGLE_CLIENT_SECRET = "Onp7-_ZzbjfRRl7sWODWW2af";

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    connection.query('SELECT * from records', function(err, rows, fields) {

    // used to deserialize the user
        passport.deserializeUser(function(id, done) {
            connection.query("SELECT DISTINCT * FROM users WHERE id = ? ",[id], function(err, rows, fields){
                console.log(err, rows, fields);
                done(err, rows);
            });
        });
    });

    // =========================================================================
    // facebook ==================================================
    // =========================================================================

    var fbConfig = require('./fb.js');

    //console.log(fbConfig.appID);

    passport.use('facebook', new FacebookStrategy({
                clientID        : '878110185571614',
                clientSecret    : '29b28411b68ce0421b6bfd430f4d7c3b',
                callbackURL     : 'http://localhost:8080/auth/facebook/callback'
                //callbackURL     : fbConfig.callbackUrl
            },
            // facebook will send back the tokens and profile
            function(access_token, refresh_token, profile, done) {
            //function( sadf, sadf, asdf, sadf){

                //console.log('profile', profile);
                //console.log('access_token :'+ access_token, 'refresh_token: ' + refresh_token, 'profile :'+ profile, 'done: '+ done);

                // asynchronous
                process.nextTick(function() {
                    //console.log('SELECT DISTINCT * FROM `fb` WHERE `id`="'+profile.id+'"');
                    //connection.query('SELECT DISTINCT * FROM `fb` WHERE `email`="'+profile.emails+'"'  , function(err, rows, fields) {
                    //    if (err)
                    //        return done(err);
                    //    if (rows) {
                    //        return done(null, profile); // user found, return that user
                    //        //return done(null, 0); // user found, return that user
                    //    } else {
                    //        connection.query('INSERT INTO `fb`(`id`, `access_token`, `firstName`, `lastName`, `email`) VALUES ("'+profile.id+'","'+access_token+'","'+profile.name.givenName+'","'+profile.name.familyName+'","'+profile.emails[0].value+'")', function(err, rows, fields) {
                    //            if (!err) {
                    //                return done(null, profile);
                    //                //return done(null, 0);
                    //            }
                    //            else {
                    //                console.log('Error while performing Insert Query.');
                    //            }
                    //        });
                    //    }
                    //
                    //});

                    return done(null, profile)
                });

            })
    );

    //============================== TWITTER ======================

    passport.use(new TwitterStrategy({
            consumerKey: "O6D9K2IRMHkPf6agrZOIrl6VI",
            consumerSecret: "c4K2Hv1OVIFEbC93r8ZlwQtdExMLfcFNPnQf120Qt9vVQkpBia",
            callbackURL: "http://localhost:8080/auth/twitter/callback"
        },
        function(token, tokenSecret, profile, done) {
            process.nextTick(function () {
                //Check whether the User exists or not using profile.id
                //if(config.use_database==='true')
                //{
                //    //Perform MySQL operations.
                //}
            });
            return done(null, profile);
        }
    ));


    //======================== GOOGLE ==================================

    passport.use(new GoogleStrategy({
            clientID: '16552490808-pv5haqfls51amaqn2hgfojmltolgue98.apps.googleusercontent.com',
            clientSecret: 'Onp7-_ZzbjfRRl7sWODWW2af',
            callbackURL: "http://localhost:8080/auth/google/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {

                // To keep the example simple, the user's Google profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the Google account with a user record in your database,
                // and return that user instead.
                return done(null, profile);
            });
        }
    ));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    // if there is no user with that username
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };

                    var insertQuery = "INSERT INTO users ( username, password ) values (?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            connection.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }

                // if the user is found but the password is wrong
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );
};
