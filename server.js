// server.js
var MainPath = __dirname;
// set up ======================================================================
// get all the tools we need
var express  = require('express');
var expressSession  = require('express-session');
var cookieParser = require('cookie-parser');
var util = require('util');
var Facebook = require('passport-facebook');
var Twitter = require('passport-twitter');
//var Google = require('passport-google')
var Google = require('passport-google-oauth')
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app      = express();
var port     = process.env.PORT || 8080;
var passport = require('passport');
var flash    = require('connect-flash');

//      16552490808-pv5haqfls51amaqn2hgfojmltolgue98.apps.googleusercontent.com
//      Onp7-_ZzbjfRRl7sWODWW2af

// configuration ===============================================================
// connect to our database

app.set('view engine', 'ejs'); // set up ejs for templating

app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({	extended: true}));
app.use(bodyParser.json());
app.use(cookieParser()); // read cookies (needed for auth)
app.use(express.static(__dirname + '/views'));

// required for passport
app.use(expressSession({
    secret: 'vidyapathaisalwaysrunning',
    resave: true,
    saveUninitialized: true
} )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(flash()); // use connect-flash for flash messages stored in session

//var routes =
require('./config/passport')(passport); // pass passport for configuration
//app.use('/', routes);
//========== CRUD ======================

var mysql = require('mysql');
var dbconfig = require('./config/database');

//var connection = mysql.createConnection(dbconfig.connection);
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'my_schema'
});
connection.connect();

app.get('/api/todos', function(req, res) {

    connection.query('SELECT * from records', function(err, rows, fields) {
        //console.log(rows);
        if (!err) {
            res.json(rows);
        }
        else
            console.log('Error while performing Query.');
    });

});

app.post('/api/todos', function(req, res) {

    connection.query('INSERT INTO `records`( `text`)  VALUES ("'+req.body.text+'")', function(err, rows, fields) {
        if (!err) {
            connection.query('SELECT * from records', function(err, rows, fields) {
                if (!err) {
                    res.json(rows);
                }
                else
                    console.log('Error while performing Select Query.');
            });
        }
        else
            console.log('Error while performing Insert Query.');
    });

});

app.delete('/api/todos/:todo_id', function(req, res) {
    //console.log(req.params.todo_id);

    connection.query('DELETE FROM `records` WHERE id="'+req.params.todo_id+'" ', function(err, rows, fields) {
        if (!err) {
            connection.query('SELECT * from records', function(err, rows, fields) {
                if (!err) {
                    res.json(rows);
                }
                else
                    console.log('Error while performing Select Query.');
            });
        }
        else
            console.log('Error while performing delete Query.');
    });

});

app.put('/api/todos/:todo_id', function(req, res) {
    //console.log(req.params.todo_id);
    console.log(req.params);
});

function handleDisconnect(connection) {
    connection.on('error', function(err) {
        if (!err.fatal) {
            return;
        }

        if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err;
        }

        console.log('Re-connecting lost connection: ' + err.stack);

        connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : 'root',
            database : 'my_schema'
        });
        handleDisconnect(connection);
        connection.connect();
    });
}

handleDisconnect(connection);

// routes ======================================================================
require('./app/routes.js')(app, passport,MainPath); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
