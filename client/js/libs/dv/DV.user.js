
define(['Common', 'Cookie'], function(common, cookie) {

  var DV = DV || {};

  return DV.user = (function () {
    'use strict';

    var
    _user = {},
    $     = common._$,
    c     = common._con;


    function load(id, cb) {
      // may want to cache user using cookie.js or store.js (see starred git repos)
      $.ajax({
        url     : common.config.domain + '/user/load/' + id + '/',
        success : function(data, textStatus, xhr) {
          _user = JSON.parse(data);
          return cb(null, _user);
        },
        error   : function(xhr, textStatus, err) {
          return cb(err);
        }
      });
    }

    function current(cb) {
      var u = cookie.get('_user');

      if (u && u.length) {
        _user = JSON.parse(u);
        return cb(null, _user);
      }
      else {
        $.ajax({
          url     : common.config.domain + '/user/current/',
          success : function(data, textStatus, xhr) {
            _user = JSON.parse(data);
            return cb(null, _user);
          },
          error   : function(xhr, textStatus, err) {
            return cb(err);
          }
        });
      }
    }


    function save(user, cb) {
      $.ajax({
        url     : common.config.domain + '/user/create/',
        data    : { obj: JSON.stringify(user) },
        success : function(data, textStatus, xhr) {
          return cb(null, data);
        },
        error   : function(xhr, textStatus, err) {
          return cb(err);
        }
      });
    }


    return {
      load    : load,
      current : current,
      save    : save,
      user    : _user
    };

  }());

});
