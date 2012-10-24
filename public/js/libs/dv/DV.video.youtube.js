
define(['Common', 'UI'], function(common, UI) {

  var DV = DV || {};

  return DV.youtube = (function () {
    'use strict';

    var
    player      = null,
    playerState = -1,
    $           = common._$,
    c           = common._con,
    YT          = common._window.YT,
    alert       = common._alert,
    typeName    = 'youtube',
    isLoaded    = false;


    function loadPlayer(o) {
      if (player) {
        player.loadVideoById(o.videoId);
        o.cb(false);
      }
      else {
        player = new YT.Player(o.iframeId, {
          height  : '390',
          width   : '640',
          videoId : o.videoId,
          events  : {
            onStateChange : onPlayerStateChange,
            onError       : onPlayerError,
            onReady       : function (event) {
              return onPlayerReady(event, o);
            }
          }
        });
      }

      // fallback as onReady event does not fire in firefox
      setTimeout(function () {
        if (!isLoaded) {
          onPlayerReady(null, o);
        }
      }, 1000);
    }


    function onPlayerReady (event, o) {
      DV.youtube.player = player;
      isLoaded = true;
      o.cb(true);
    }


    function onPlayerStateChange(event) {
      DV.youtube.playerState = playerState = event.data;
      if (event.data === 0) {
        player.stopVideo();
      }
    }


    function onPlayerError(error) {
      UI.displayMessage({
        text: 'An error occured while trying to load your video. Please enter a new URL or video Id.',
        type: 'error'
      });
    }


    function getId(url) {
      var o = common.getURIObject(url);

      if (o.host() === 'youtu.be') {
        return o.path().replace('/', '');
      }
      if (o.path() === '/watch') {
        return o.search(true)['v'];
      }
      if (o.directory() === '/embed') {
        return o.path().split('/')[2];
      }
    }


    function loaded(cb) {
      return player.getDuration;
    }


// player wrapper function

    function toggle() {
      if (DV.youtube.playerState === 1) {
        pause();
      } else {
        play();
      }
    }

    function play() {
      if (player && player.playVideo) {
        player.playVideo();
      }
    }


    function pause() {
      if (player && player.pauseVideo) {
        player.pauseVideo();
      }
    }


    function stop() {
      if (player && player.stopVideo) {
        player.stopVideo();
      }
    }


    function seekTo(seekVal) {
      if (player && player.seekTo) {
        player.seekTo(seekVal, true);
      }
    }


    function unLoad() {
      if (player && player.clearVideo) {
        stop();
        player.clearVideo(); // Note that this function has been deprecated in the ActionScript 3.0 Player API.
      }
    }


    function destroy() {
      UI.controls.playerWrapper.html('');
      player = null;
    }


    function getCurrentTime(cb) {
      var currentTime = player.getCurrentTime ? player.getCurrentTime() : 0;
      if (cb)
        return cb(currentTime);
      else
        return currentTime;
    }


    function getDuration(cb) {
      var duration = player.getDuration ? player.getDuration() : 0;
      if (cb)
        return cb(duration);
      else
        return duration;
    }


    function getVideoEmbedCode(cb) {
      var videoEmbedCode = player.getVideoEmbedCode ? player.getVideoEmbedCode() : '';
      if (cb)
        return cb(videoEmbedCode);
      else
        return videoEmbedCode;
    }


    function getVideoUrl(cb) {
      var videoUrl = player.getVideoUrl ? player.getVideoUrl() : '';
      if (cb)
        return cb(videoUrl);
      else
        return videoUrl;
    }


    function getPlayerState(cb) {
      var playerState = player.getPlayerState ? player.getPlayerState() : -2;
      if (cb)
        return cb(playerState);
      else
        return playerState;
    }


    return {
      destroy           : destroy,
      getCurrentTime    : getCurrentTime,
      getDuration       : getDuration,
      getId             : getId,
      getPlayerState    : getPlayerState,
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
