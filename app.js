var INDEX = 0;
var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];

var COUNT = 0;

/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var lusca = require('lusca');
var methodOverride = require('method-override');
var multer  = require('multer')

var _ = require('lodash');
var MongoStore = require('connect-mongo')(session);
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var connectAssets = require('connect-assets');

var multer = require('multer');
var done = false;

var fs = require('fs-extra');
var formidable = require('formidable');
var util = require('util');
var qt = require('quickthumb');

// var User = require('models/User');
var request = require('request');

var sys = require('sys');
var base64_decode = require('base64').decode;

var XMLHttpRequest = require('xhr2');

/**
 * Controllers (route handlers).
 */
var homeController = require('./controllers/home');
var userController = require('./controllers/user');
var apiController = require('./controllers/api');
var contactController = require('./controllers/contact');

/**
 * API keys and Passport configuration.
 */
var secrets = require('./config/secrets');
var passportConf = require('./config/passport');

/**
 * Create Express server.
 */
var app = express();

var users;

var imgur = require('imgur-node-api');
path = require('path');
var Puush = require('puush');
var puush = new Puush();

imgur.setClientID("f948415a877272b");

/**
 * Connect to MongoDB.
 */
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(connectAssets({
  paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')]
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: path.join(__dirname, 'uploads') }));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
// app.use(express.csrf());
// app.use(function(req,res,next){
//   res.locals.token = req.session._csrf;
//   next();
// });
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca({
  csrf: false,
  xframe: 'SAMEORIGIN',
  xssProtection: false
}));
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  if (/api/i.test(req.path)) req.session.returnTo = req.path;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

app.use(qt.static(__dirname+"/"));

app.use(multer({ dest: '/uploads',
  rename : function(fieldname, filename) {
    return filename+Date.now();
  },
  onFileUploadStart: function(file) {
    console.log(file.originalname + ' is starting ...');
  },
  onFileUploadComplete: function(file) {
    console.log(file.fieldname + ' uploaded to ' + file.path);
    done=true;
  }
}));

app.post('/api/photo', function(req,res){
  console.log(req.files);
  fs.readFile(req.files.facial_scan.path, function(err, data) {
    if (err) throw err;
    var img = new Buffer(data).toString('base64');

    var date = new Date();

    // var subj = '';

    // User.findById(req.session.passport.user, function(data){
    //   subj = data.profile.name.replace(/ /g,'');
    // });

    var Request = new XMLHttpRequest();

    Request.open('POST', 'https://api.kairos.com/enroll');

    Request.setRequestHeader('Content-Type', 'application/json');
    Request.setRequestHeader('app_id', '9b369392');
    Request.setRequestHeader('app_key', 'eab2f40826fb03bd9ab9471d375e97bc');

    Request.onreadystatechange = function () {
      if (this.readyState === 4) {
        console.log('Status:', this.status);
        console.log('Headers:', this.getAllResponseHeaders());
        console.log('Body:', this.responseText);
      }
    };

    console.log(req.session.passport.user);

    var body = {
      'image': "http://104.131.57.6:3000/uploads/" + req.files.facial_scan.name,
      'subject_id': req.session.passport.user,
      'gallery_name': 'gallerytest1'
    };

    Request.send(JSON.stringify(body));

    userController.addSubjectID(req.session.passport.user, alphabet[INDEX]);

    window.locaton = "/account";
    INDEX++;
  });

  if (done==true){
    window.locaton = "/account";
  }
});

app.post('/api/glass', function(req, res){
  var img = req.image;
  var image = base64_decode(img);
  var Request = new XMLHttpRequest();

  Request.open('POST', 'http://uploads.im/api');

  Request.onreadystatechange = function () {
    if (this.readyState === 4) {
      console.log('Status:', this.status);
      console.log('Headers:', this.getAllResponseHeaders());
      console.log('Body:', this.responseText);
    }
  };

  var body = {
    'upload': image
  };

  Request.send(JSON.stringify(body));

  // imgur.upload(img, function(err, res)
  // {
  //   if (err) {
  //     console.error(err.message);
  //   }
  //   console.log("in imgur");
  //   console.log(res.data.link);

    // var Request = new XMLHttpRequest();

    // Request.open('POST', 'https://api.kairos.com/recognize');

    // Request.setRequestHeader('Content-Type', 'application/json');
    // Request.setRequestHeader('app_id', '9b369392');
    // Request.setRequestHeader('app_key', 'eab2f40826fb03bd9ab9471d375e97bc');

    // Request.onreadystatechange = function () {
    //   if (this.readyState === 4) {
    //     console.log('Status:', this.status);
    //     console.log('Headers:', this.getAllResponseHeaders());
    //     console.log('Body:', this.responseText);
    //   }
    // };

    // var body = {
    //   'image': json.data.link,
    //   'gallery_name': 'gallerytest1'
    // };

    // Request.send(JSON.stringify(body));
  // });
  // }).catch( function(err) {
  //   console.error(err.message);
  // });
  
  // fs.writeFile("/uploads/face_"+COUNT+".jpg", image, function(err){
  //   if (err) return console.error(err);
  //   console.log("Saved at /uploads/face_"+COUNT+".jpg");
  //   console.log(req + "\n------------\n");
  // });

  // var Request = new XMLHttpRequest();

  // Request.open('POST', 'https://api.kairos.com/recognize');

  // Request.setRequestHeader('Content-Type', 'application/json');
  // Request.setRequestHeader('app_id', '9b369392');
  // Request.setRequestHeader('app_key', 'eab2f40826fb03bd9ab9471d375e97bc');

  // Request.onreadystatechange = function () {
  //   if (this.readyState === 4) {
  //     console.log('Status:', this.status);
  //     console.log('Headers:', this.getAllResponseHeaders());
  //     console.log('Body:', this.responseText);
  //   }
  // };

  // var body = {
  //   'image': "http://104.131.57.6:3000/uploads/face_" + COUNT + ".jpg",
  //   'gallery_name': 'gallerytest1'
  // };

  // Request.send(JSON.stringify(body));
  // COUNT += 1

});

app.get('/uploads/:fileName', function(req, res) {
  var fileName = req.params.fileName;

  res.sendFile('uploads/' + fileName);
});


// app.post('/getData', function(req,res){
//   var id = req.id;
//   User.findById(id, function(err, user){
//     if (err) throw err;
//     var token = _.find(user.tokens, { kind: 'linkedin' });
//     var linkedin = Linkedin.init(token.accessToken);
//     linkedin.people.me(function(err, $in) {
//       if (err) return next(err);
//       var profile = $in;
//       console.log(profile);
//       // res.json({
//       //   name: profile.formattedName,
//       //   headline: profile.headline,

//       // })
//     });
//   });
// });


/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */
app.get('/api', apiController.getApi);
app.get('/api/lastfm', apiController.getLastfm);
app.get('/api/nyt', apiController.getNewYorkTimes);
app.get('/api/aviary', apiController.getAviary);
app.get('/api/steam', apiController.getSteam);
app.get('/api/stripe', apiController.getStripe);
app.post('/api/stripe', apiController.postStripe);
app.get('/api/scraping', apiController.getScraping);
app.get('/api/twilio', apiController.getTwilio);
app.post('/api/twilio', apiController.postTwilio);
app.get('/api/clockwork', apiController.getClockwork);
app.post('/api/clockwork', apiController.postClockwork);
app.get('/api/foursquare', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFoursquare);
app.get('/api/tumblr', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTumblr);
app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);
app.get('/api/github', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getGithub);
app.get('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
app.post('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postTwitter);
app.get('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getVenmo);
app.post('/api/venmo', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postVenmo);
app.get('/api/linkedin', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getLinkedin);
app.get('/api/instagram', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getInstagram);
app.get('/api/yahoo', apiController.getYahoo);
app.get('/api/ordrin', apiController.getOrdrin);
app.get('/api/paypal', apiController.getPayPal);
app.get('/api/paypal/success', apiController.getPayPalSuccess);
app.get('/api/paypal/cancel', apiController.getPayPalCancel);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
app.get('/auth/linkedin', passport.authenticate('linkedin', { state: 'SOME STATE' }));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});

/**
 * OAuth authorization routes. (API examples)
 */
app.get('/auth/foursquare', passport.authorize('foursquare'));
app.get('/auth/foursquare/callback', passport.authorize('foursquare', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/foursquare');
});
app.get('/auth/tumblr', passport.authorize('tumblr'));
app.get('/auth/tumblr/callback', passport.authorize('tumblr', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/tumblr');
});
app.get('/auth/venmo', passport.authorize('venmo', { scope: 'make_payments access_profile access_balance access_email access_phone' }));
app.get('/auth/venmo/callback', passport.authorize('venmo', { failureRedirect: '/api' }), function(req, res) {
  res.redirect('/api/venmo');
});

/**
 * OpenCV image processing
 */
app.get('/processImage', apiController.processImage);

app.post('/uploadImage', apiController.uploadImage);


/**
 * Error Handler.
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
