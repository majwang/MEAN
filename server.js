var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var passport  = require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./app/models/user'); // get the mongoose model
var port        = process.env.PORT || 8080;
var jwt         = require('jwt-simple');
var Contact = require('./app/models/contact');
var path = require("path");
var ObjectID = mongoose.ObjectID;
 
// log to console
app.use(morgan('dev'));
 
// Use the passport package in our application
app.use(passport.initialize());

app.use(express.static(__dirname + '/public'));
// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


/*
var serveStatic = require('serve-static');
app.use(serveStatic(__dirname, {'index': ['public/index.html']}))
*/
// demo Route (GET http://localhost:8080)
//app.get('/', function(req, res) {
//  res.send('Hello! The API is at http://localhost:' + port + '/api');
//});
var db;
// connect to database process.env.MONGODB_URI
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', function(err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  db = database;
  console.log('Mongoose connected to ' + process.env.MONGODB_URI);
});
// pass passport for configuration
require('./config/passport')(passport);
 
// bundle our routes
var apiRoutes = express.Router();
app.use(apiRoutes);
apiRoutes.get('/contacts', function(req, res) {
	Contact.find({}, function (err, contacts) {
	  if (err) return console.log(err);
	  else{
		//console.log(contacts);
		res.json(contacts);
	  }
	});
	
}); 

apiRoutes.post('/contacts', function(req, res) {
	var contact = new Contact();
	contact.firstName = req.body.firstName;
	contact.lastName = req.body.lastName;
	contact.email = req.body.email;
	contact.save(function(err, contact){
		if(err) {return console.log(err);}
		else{
			res.json(contact);
		}
	});
});

apiRoutes.get('/contacts/:id', function(req, res) {
	//console.log("ID: " + req.params.id);
	Contact.findOne({'_id' : req.params.id}, function (err, contact) {
	  if (err) return console.log(err);
	  else{
		//console.log(contact);
		res.json(contact);
	  }
	});
	
}); 

apiRoutes.put('/contacts/:id', function(req, res) {
	//console.log("ID: " + req.params.id);
	var contact = {
		firstName : req.body.firstName,
		lastName : req.body.lastName,
		email : req.body.email
	};
	Contact.update({'_id' : req.params.id}, contact, function (err, contact) {
	  if (err) return console.log(err);
	  else{
		//console.log(contact);
		res.end();
	  }
	});
	
}); 

apiRoutes.delete('/contacts/:id', function(req, res) {
	//console.log("ID: " + req.params.id);
	Contact.deleteOne({'_id' : req.params.id}, function (err, contact) {
	  if (err) return console.log(err);
	  else{
		//console.log(contact);
		res.end();
	  }
	});
	
}); 
// create a new user account (POST http://localhost:8080/api/signup)
apiRoutes.post('/signup', function(req, res) {
  if (!req.body.name || !req.body.password) {
    res.json({success: false, msg: 'Please pass name and password.'});
	console.log("HERE" + req.body.name);
  } else {
    var newUser = new User({
      name: req.body.name,
      password: req.body.password
    });
	console.log(newUser);
    // save the user
    newUser.save(function(err) {
      if (err) {
        return res.json({success: false, msg: 'Username already exists.'});
      }
      res.json({success: true, msg: 'Successful created new user.'});
    });
  }
});
 
// connect the api routes under /api/*
//app.use('/api', apiRoutes);

// route to authenticate a user (POST http://localhost:8080/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  User.findOne({
    name: req.body.name
  }, function(err, user) {
    if (err) {throw err;console.log("ERRORRRR");}
 
    if (!user) {
		console.log("!USER, " + req.body.name);
      res.send({success: false, msg: 'Authentication failed. User not found.'});
    } else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          res.json({success: true, token: 'JWT ' + token});
        } else {
          res.send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
      });
    }
  });
});

// route to a restricted info (GET http://localhost:8080/api/memberinfo)
apiRoutes.get('/memberinfo', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome in the member area ' + user.name + '!'});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});
 
function getToken (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};
 
// Start the server
app.listen(port);
console.log('There will be dragons: http://localhost:' + port);