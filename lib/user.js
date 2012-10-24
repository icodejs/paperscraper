
var
resourceful = require('resourceful'),
dbFunctions = require('./dbFunctions'),
config      = require('./config'),
publicFuncs = {};



var User = resourceful.define('user', function (id) {
  this.use('couchdb', {
    uri: config.couchDB.user
  });

  //this.string('_id');
  this.string('username');
  this.string('email');
  this.array('docs');
  this.object('socialData');
  this.string('website');
  this.object('image');
  this.string('location');
  this.string('gender');
  this.timestamps();
});


function socialLogin(obj, callback) {
  var sd = {}; sd[obj.source] = obj.userMeta;

  User.get(obj.id, function (err, user) {
    if (err && err.error !== 'not_found') {
      console.log(err);
      return callback(err);
    }

    if (err && err.error === 'not_found') {
      User.create({
        id         : obj.id,
        username   : obj.userMeta.name,
        email      : obj.userMeta.email,
        docs       : [],
        socialData : sd,
        website    : obj.website,
        image      : obj.image,
        location   : obj.location
      }, function (err, newUser) {
        if (err)
          return callback(err);
        callback(null, newUser);
      });
    }
    else {
      if (!user.socialData[obj.source]) {
        user.socialData[obj.source] = obj.userMeta;
        user.update(user, function (err, updateUser) {
          if (err)
            callback(null, user);
          else
            callback(null, updateUser);
        }); // end update
      }
      else {
        callback(null, user);
      }
    }
  }); // end User.find();
}


publicFuncs             = dbFunctions.get(User);
publicFuncs.socialLogin = socialLogin;

module.exports          = publicFuncs;
