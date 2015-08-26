var FacebookStrategy = require('passport-facebook').Strategy;
var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'my_schema'
});
connection.connect();
var fbConfig = require('../config/fb.js');

module.exports = function(passport) {

    passport.use('facebook', new FacebookStrategy({
            clientID        : fbConfig.appID,
            clientSecret    : fbConfig.appSecret,
            callbackURL     : fbConfig.callbackUrl
        },

        // facebook will send back the tokens and profile
        function(access_token, refresh_token, profile, done) {

            console.log('profile', profile);

            // asynchronous
            process.nextTick(function() {

                connection.query('SELECT DISTINCT * FROM `fb` WHERE `id`="'+profile.id+'"'  , function(err, rows, fields) {
                    if (err)
                        return done(err);
                    if (rows) {
                        return done(null, profile); // user found, return that user
                    } else {
                        connection.query('INSERT INTO `fb`(`id`, `access_token`, `firstName`, `lastName`, `email`) VALUES ("'+profile.id+'","'+access_token+'","'+profile.name.givenName+'","'+profile.name.familyName+'","'+profile.emails[0].value+'")', function(err, rows, fields) {
                        if (!err) {
                            return done(null, profile);
                        }
                        else {
                            console.log('Error while performing Insert Query.');
                        }
                        });
                    }

                });
            });

        })
    );

};
