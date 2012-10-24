
var
conf        = require('../lib/config');
User        = require('../lib/user'),
redirectUrl = '/your-docs';


exports.setup = function (everyauth) {
  var c;

  if (process.env.NODE_ENV === 'production') {
    c = conf.everyauth.production;
  }
  else {
    c = conf.everyauth.development;
  }


// -- everymodule --

  everyauth.everymodule
    .findUserById(function (req, userId, callback) {
      User.load(userId, function (err, user) {
        req.session.user = user;
        callback(null, user);
      });
    })
    .handleLogout( function (req, res) {
        req.logout();
        req.session.user = null;
        this.redirect(res, this.logoutRedirectPath());
      })
    .logoutPath('/logout')
    .logoutRedirectPath('/login');


// -- github --

  everyauth.github
    .appId(c.github.appId)
    .appSecret(c.github.appSecret)
    .handleAuthCallbackError(handleAuthCallbackError)
    .findOrCreateUser(function (session, accessToken, accessTokenExtra, userMeta) {
      var promise = this.Promise();

      User.socialLogin({
        id          : userMeta.id,
        username    : userMeta.name,
        email       : userMeta.email,
        userMeta    : userMeta,
        website     : userMeta.blog,
        image       : { url: userMeta.avatar_url, gravatarId: userMeta.gravatar_id },
        source      : 'github',
        description : userMeta.bio,
        location    : userMeta.location || ''
      }, function (err, user) {
        if (err)
          return promise.fulfill([err]);
        promise.fulfill(user);
      });

      return promise;
    })
    .redirectPath(redirectUrl);


// -- twitter --

  everyauth.twitter
    .consumerKey(c.twitter.consumerKey)
    .consumerSecret(c.twitter.consumerSecret)
    .handleAuthCallbackError( handleAuthCallbackError)
    .findOrCreateUser(function (session, accessToken, accessTokenExtra, userMeta) {
      var promise = this.Promise();

      User.socialLogin({
        id          : userMeta.id,
        username    : userMeta.name,
        userMeta    : userMeta,
        website     : userMeta.url,
        image       : { url: userMeta.profile_image_url },
        source      : 'twitter',
        description : userMeta.description,
        location    : userMeta.location || ''
      }, function (err, user) {
        if (err)
          return promise.fulfill([err]);
        promise.fulfill(user);
      });

      return promise;
    })
    .redirectPath(redirectUrl);


// -- facebook --

  everyauth.facebook
    .appId(c.facebook.appId)
    .appSecret(c.facebook.appSecret)
    .handleAuthCallbackError(handleAuthCallbackError)
    .findOrCreateUser(function (session, accessToken, accessTokenExtra, userMeta) {
      var promise = this.Promise();

      User.socialLogin({
        id          : userMeta.id,
        username    : userMeta.name,
        gender      : userMeta.gender,
        userMeta    : userMeta,
        image       : { url: '' },
        source      : 'facebook',
        location    : userMeta.locale || ''
      }, function (err, user) {
        if (err)
          return promise.fulfill([err]);
        promise.fulfill(user);
      });

      return promise;
    })
    .redirectPath(redirectUrl);


// -- google --

  everyauth.google
    .appId(c.google.appId)
    .appSecret(c.google.appSecret)
    .scope('https://www.googleapis.com/auth/userinfo.profile https://www.google.com/m8/feeds/')
    .handleAuthCallbackError( handleAuthCallbackError)
    .findOrCreateUser(function (session, accessToken, accessTokenExtra, userMeta) {
      var promise = this.Promise();

      User.socialLogin({
        id          : userMeta.id,
        username    : userMeta.name,
        gender      : userMeta.gender,
        userMeta    : userMeta,
        image       : { url: userMeta.picture },
        source      : 'google',
        location    : userMeta.locale || ''
      }, function (err, user) {
        if (err)
          return promise.fulfill([err]);
        promise.fulfill(user);
      });

      return promise;
    })
    .redirectPath(redirectUrl);


// -- vimeo --

  everyauth.vimeo
    .consumerKey(c.vimeo.consumerKey)
    .consumerSecret(c.vimeo.consumerSecret)
    .handleAuthCallbackError(handleAuthCallbackError)
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, userMeta) {
      var promise = this.Promise();

      User.socialLogin({
        id          : userMeta.id,
        username    : userMeta.display_name,
        userMeta    : userMeta,
        website     : userMeta.url[0],
        image       : { url: userMeta.portraits.portrait[3]._content },
        source      : 'vimeo',
        description : userMeta.bio,
        location    : userMeta.location || ''
      }, function (err, user) {
        if (err)
          return promise.fulfill([err]);
        promise.fulfill(user);
      });

      return promise;
    })
    .redirectPath(redirectUrl);


// -- dropbox --

  everyauth.dropbox
    .consumerKey(c.dropbox.consumerKey)
    .consumerSecret(c.dropbox.consumerSecret)
    .handleAuthCallbackError(handleAuthCallbackError)
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, userMeta) {
      var promise = this.Promise();

      User.socialLogin({
        id          : userMeta.id,
        username    : userMeta.display_name,
        email       : userMeta.email,
        userMeta    : userMeta,
        image       : { url: '' },
        source      : 'dropbox',
        location    : userMeta.country || ''
      }, function (err, user) {
        if (err)
          return promise.fulfill([err]);
        promise.fulfill(user);
      });

      return promise;
    })
    .redirectPath(redirectUrl);

}; // end setup

function handleAuthCallbackError(req, res) {
  res.redirect('/login');
}
