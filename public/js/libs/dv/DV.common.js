
define(['jquery', 'Underscore', 'URI', 'FitVids', 'Ddate', 'YoutubeApi'], function($, _, URI, fv, ddate, YoutubeApi) {

  var DV = DV || {};

  return DV.common = (function (W, D) {
    'use strict';

    var
    _jQuery   = $,
    _window   = W,
    _document = D,
    _con      = W.console,
    _YT       = W.YT,
    _URI      = URI,
    _alert    = W.alert,
    _FV       = fv,

    config = {
      defaultUser : 'icodejs@gmail.com',
      domain      : '',
      youtubeUrl  : 'http://www.youtube.com/watch?v='
    };


    function get(id) {
      return document.getElementById(id);
    }


    function updateHTML(elmId, value) {
      $('#' + elmId).html(value);
    }


    function getJQueryObjectHash(html, selectors) {
      var
      i, sel, key,
      o     = {},
      len   = selectors.length,
      $html = html.jquery ? html : $(html);

      for (i = 0; i < len; i += 1) {
        sel    = selectors[i];
        key    = sel.replace('.', '').replace('#', '');
        o[key] = $html.find(sel);
      }
      return o;
    }


    function removeItemByValue(arr, value, prop, cb) {
      var filteredArray = _.filter(arr, function (note) {
          if (note[prop]) {
            return (note[prop] !== value);
          }
          else {
            return (note !== value);
          }
      });
      return cb(filteredArray);
    }


    function twoDec(value) {
      return parseFloat(Math.round(value * 100) / 100).toFixed(2);
    }


    // http://remysharp.com/2010/07/21/throttling-function-calls/
    function throttle(fn, delay) {
      var timer = null;
      return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(context, args);
        }, delay);
      };
    }


    function checkProtocol(url) {
      if (url.indexOf('http://') === -1 && url.indexOf('https://') === -1)
        return 'http://' + url;
      return url;
    }


    function getURIObject(url) {
      if (url) {
        var uri = new URI(sanitise(url));
        return uri;
      }
      else {
        throw new Error('DV.video.getURIObject expect a URL string.');
      }
    }


    function sanitise(url) {
      // may need to include other checks as issues come up?
      var parsedUri = URI.parse(url);

      if (parsedUri.hostname && parsedUri.path) {
        return checkProtocol(url);
      }
      else {
        throw new Error('Unrecognised Youtube URL structure: ' + url);
      }
    }


    function getTimeFromSeconds (seconds) {
      return new Date().clearTime().addSeconds(seconds).toString('H:mm:ss');
    }


    function addPrettyInPointToNotes(arr) {
      _.each(arr, function (note) {
        note.inPointPretty = getTimeFromSeconds(note.inPoint);
      });
    }


    function debugUri (o) {
      // accept URI object e.g. new URI('http://localhost:4000/d/213453453')
      _con.log('object: '    , o);
      _con.log('host: '      , o.host());
      _con.log('domain: '    , o.domain());
      _con.log('subdomain: ' , o.subdomain());
      _con.log('tld: '       , o.tld());
      _con.log('pathname: '  , o.pathname());
      _con.log('path: '      , o.path());
      _con.log('directory: ' , o.directory());
      _con.log('query: '     , o.query());
      _con.log('search: '    , o.search(true));
    }


    function makeid(len) {
      var i, text = '', possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
      for (i = 0; i < len; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }


    function getId(videoId) {
      return Date.now().getTime();
      //return Date.now().getTime() + '_' + videoId || makeid(8);
    }


    function getKeyCodeInfo(e) {
      var keycode = e.keyCode || e.which;
      _con.log(e.ctrlKey);
      _con.log(e.shiftKey);
      _con.log(keycode);
    }


    return {
      _$                      : _jQuery,
      _FV                     : _FV,
      _URI                    : _URI,
      _YT                     : _YT,
      _alert                  : _alert,
      _con                    : _con,
      _document               : _document,
      _window                 : _window,
      addPrettyInPointToNotes : addPrettyInPointToNotes,
      checkProtocol           : checkProtocol,
      config                  : config,
      debugUri                : debugUri,
      get                     : get,
      getId                   : getId,
      getJQueryObjectHash     : getJQueryObjectHash,
      getKeyCodeInfo          : getKeyCodeInfo,
      getTimeFromSeconds      : getTimeFromSeconds ,
      getURIObject            : getURIObject,
      removeItemByValue       : removeItemByValue,
      throttle                : throttle,
      twoDec                  : twoDec,
      updateHTML              : updateHTML
    };

  }(window, document));

});
