
var
express         = require('express'),
app             = express(),
redis           = require('redis'),
RedisStore      = require('connect-redis')(express),
everyauth       = require('everyauth'),
everyauthHelper = require('./lib/everyauthHelper'),
user            = require('./routes/user'),
routes          = require('./routes'),
webPage         = require('./lib/webPage'),
conf            = require('./lib/config'),
mail            = require('./lib/mail'),

sessionStore    = new RedisStore({
  host : conf.redis.host,
  port : conf.redis.port,
  pass : conf.redis.pass,
  db   : conf.redis.db
});


// -- Everyauth --
// everyauth.debug = true;
//everyauthHelper.setup(everyauth);


// -- Configuration --
app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');

  app.locals({
    title  : conf.app.name,
    email  : conf.mail.address,
    user   : null,
    loadJs : false,
    isLive : (process.env.NODE_ENV === 'production'),
    pageId : ''
  });

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser(conf.cookie.secret));
  app.use(express.session({
    store  : sessionStore,
    cookie : {
      maxAge   : 60000 * 60 * 24 * 7,
      httpOnly : false
    }
  }));
  //app.use(express.favicon());
  //app.use(everyauth.middleware());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(function (err, req, res, next) {
    var error = err.toString();

    mail.send({
      subject : 'Express middleware error',
      text    : error
    }, function (err, message) {
      if (!err) console.log('email sent! ' + message);
    });

    res.render('error', { title: 'oops...', error: error });
  });
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});


function requiresLogin(req, res, next) {
  if (req.session.user) {
    next();
  }
  else {
    res.redirect('/login');
  }
}


/* users */
app.get('/user/load/:email', user.load);
app.get('/user/current', user.current);
app.get('/user/create', user.create);


/* login */
app.get('/login', routes.login);


// app.get('/scrape/webPage/', function(req, res){
//   scrapeWebPage(req, res);
// });

// webPages
app.get('/load/webPages/', function(req, res){
  loadWebPages(req, res);
});

// app.get('/save/webPage/', function(req, res){
//   saveWebPage(req, res);
// });

// app.get('/save/batch/webPages/', function(req, res){
//   common.saveWebPageBatch(req, res);
// });

// // wallpapers
// app.get('/load/wallpapers/', function(req, res){
//   loadWallpapers(req, res);
// });

// app.get('/save/wallpaper/', function(req, res){
//   saveWallpaper(req, res);
// });

function loadWebPages(req, res) {
  webPage.all(function (err, results) {
    if (err)
      return res.json(500, JSON.stringify(err));
    res.json(JSON.stringify(results));
  });
}

// search terms
// app.get('/save/batch/searchterms/', function(req, res){
//   common.saveBatch(req, res);
// });


app.listen(4000);
