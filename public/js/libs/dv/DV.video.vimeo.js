
define(['Underscore', 'Common', 'UI', 'VimeoApi'], function(_, common, UI, $f) {

  var DV = DV || {};

  return DV.vimeo = (function () {
  'use strict';

    var
    $player     = [],
    player      = null,
    playerState = -1,
    $           = common._$,
    c           = common._con,
    alert       = common._alert,
    isLoaded      = false,
    typeName    = 'vimeo';


    function loadPlayer(o) {
      var
      url    = [],
      src    = '',
      iframe = $('.videoContainer iframe');

      url.push('http://player.vimeo.com/video/' + o.videoId);
      url.push('?api=1&player_id=' + o.iframeId);
      url.push('&portrait=false&title=false&byline=false');

      src = url.join('');

      if (player) {
        $(player.element).attr('src', src);
        return onPlayerReady(o, false);
      }
      else {
        if (!iframe.length) {
          iframe = $('<iframe />').attr({
            id              : o.iframeId,
            src             : src,
            frameborder     : 0,
            allowfullscreen : 'allowfullscreen'
          });
          o.wrappingElement.html(iframe);
        }

        player = $f(iframe[0]);
        player.addEvent('ready', function (player_id) {
          return onPlayerReady(o, true);
        });

        // fallback as onReady event does not fire in firefox
        setTimeout(function () {
          if (!isLoaded) {
            return onPlayerReady(o, true);
          }
        }, 1000);
      }
    }


    function onPlayerReady(o, firstLoad) {
      DV.vimeo.player = player;
      isLoaded        = true;
      o.cb(firstLoad);
    }


    function onPlayerError(error) {
      // tbc
    }


    function getId(url) {
      var o = common.getURIObject(url);

      if (o.host() === 'vimeo.com') {
        return o.path().replace('/', '');
      }
      if (o.host() === 'player.vimeo.com') {
        return o.path().split('/')[2];
      }
    }


    function loaded() {
      return isLoaded;
    }


// player wrapper function

    function toggle() {
      if (DV.vimeo.playerState === 1) {
        pause();
      } else {
        play();
      }
    }


    function play() {
      DV.vimeo.playerState = playerState = 1;
      player.api('play');
    }


    function pause() {
      DV.vimeo.playerState = playerState = 2;
      player.api('pause');
    }


    function stop() {
      unLoad();
    }


    function unLoad() {
      DV.vimeo.playerState = playerState = 0;
      player.api('unload');
    }


    function seekTo(seekVal) {
      player.api('seekTo', seekVal);
    }


    function destroy() {
      DV.vimeo.playerState = playerState = -1;
      UI.controls.playerWrapper.html('<div id="video">Loading...</div>');
      player = null;
    }


    function getCurrentTime(cb) {
      player.api('getCurrentTime', function(value, player_id) {
        if (cb) cb(value);
      });
    }


    function getDuration(cb) {
      player.api('getDuration', function(value, player_id) {
        if (cb) cb(value);
      });
    }


    function getVideoEmbedCode(cb) {
      player.api('getVideoEmbedCode', function(value, player_id) {
        if (cb) cb(_.escape(value));
      });
    }


    function getVideoUrl(cb) {
      player.api('getVideoUrl', function(value, player_id) {
        if (cb) cb(value);
      });
    }


    return {
      destroy           : destroy,
      getCurrentTime    : getCurrentTime,
      getDuration       : getDuration,
      getId             : getId,
      getVideoEmbedCode : getVideoEmbedCode,
      getVideoUrl       : getVideoUrl,
      loaded            : loaded,
      loadPlayer        : loadPlayer,
      pause             : pause,
      play              : play,
      player            : player,
      playerState       : playerState,
      seekTo            : seekTo,
      toggle            : toggle,
      typeName          : typeName,
      unLoad            : unLoad
    };

  }());

});
