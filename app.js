var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('accounts.db');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response) {
	var username = request.body.username;
	var password = request.body.password;
    console.log(username);
    console.log(password);
	if (username && password) {
		db.get(`SELECT * FROM accounts WHERE username = '${username}' AND password = '${password}';`,  function(error, results) {
            console.log(results);
			if (results) {
				request.session.loggedin = true;
				request.session.username = username;
				response.redirect('/home');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

app.get('/balance', function(request, response) {
	if (request.session.loggedin) {
        db.get(`SELECT * FROM accounts WHERE username = '${request.session.username}';`, function(err, results) {
			if (err) {
				console.log(err);
			} else if (results) {
				console.log(results.bal);
				response.send(`Your balance is: ${results.bal}`);
			} else {
				console.log("Did not find user.");
			}
		});

	} else {
		response.redirect('/');
	}
	// response.end();
});

app.listen(3000);

// db.get(`SELECT * FROM accounts WHERE username = \'root\';`, function(err, results) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log(results);
//         db.run(`UPDATE accounts SET level = \'GOD\' WHERE ID = ${results.ID};`, function(err) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 console.log('Updated!');
//             }
//         });
//     }
// })
// db.close();