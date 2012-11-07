
define(['Common', 'Youtube', 'Vimeo'], function(common, youtube, vimeo) {

  var DV = DV || {};

  return DV.video = (function () {
    'use strict';

    var
    $      = common._$,
    URI    = common._URI,
    c      = common._con,
    player = null;


    function getPlayerType(input) {
      if (input.indexOf('/') === -1 &&
            input.indexOf('?') === -1 &&
              input.indexOf('=') === -1 &&
                input.indexOf('http') === -1 &&
                  input.indexOf('https') === -1) {

        if (isNaN(input)) {
          player = youtube;
        }
        else {
          player = vimeo;
        }
        DV.video.player = player;
        return { id : input, typeName : player.typeName };
      }

      if (input.indexOf('youtu') > -1) {
        player = youtube;
      }
      else if (input.indexOf('vimeo') > -1) {
        player = vimeo;
      }
      DV.video.player = player;
      return { id : player.getId(input), typeName : player.typeName };
    }


    function setPlayerType(typeName, swap) {
      if (typeName === 'youtube') {
        player = youtube;
      }
      else if (typeName === 'vimeo') {
        player = vimeo;
      }
      DV.video.player = player;
      return player;
    }


    function getNotes(arr, vidDuration) {
      var
      i,
      currItem,
      notes =[],
      len   = arr.length;

      for (i = 0; i < len; i += 1) {
        currItem = arr[i];
        notes.push({
          id      : currItem.id,
          inPoint : (+currItem.inPoint),
          note    : currItem.note
        });
      }
      return notes;
    }


    function saveDoc(o, cb) {
      $.ajax({
        url     : common.config.domain + '/doc/save/',
        data    : { obj: JSON.stringify(o) },
        success : function (json) {
          cb(null, JSON.parse(json));
        },
        error   : function(jqXHR, textStatus, err) {
          cb(err);
        }
      });
    }


    function deleteDoc(id, cb) {
      $.ajax({
        url     : common.config.domain + '/doc/delete/' + id + '/',
        data    : {},
        success : function (json) {
          cb(null, JSON.parse(json));
        },
        error   : function(jqXHR, textStatus, err) {
          cb(err);
        }
      });
    }


    function loadDocumentByVideoId(id, cb) {
      $.ajax({
        url     : common.config.domain + '/doc/load/' + id + '/',
        data    : {},
        success : function (json) {
          var o = JSON.parse(json);
          common.addPrettyInPointToNotes(o.notes);
          cb(null, o);
        },
        error   : function(jqXHR, textStatus, err) {
          cb(err);
        }
      });
    }


    function loadDocumentById(id, cb) {
      $.ajax({
        url     : common.config.domain + '/doc/loadById/' + id + '/',
        data    : {},
        success : function (json) {
          var o = JSON.parse(json);
          common.addPrettyInPointToNotes(o.notes);
          cb(null, o);
        },
        error   : function(jqXHR, textStatus, err) {
          cb(err);
        }
      });
    }


    function loadVideos(id, cb) {
      $.ajax({
        url     : common.config.domain + '/video/load-collection/' + id + '/',
        data    : {},
        success : function (json) {
          cb(null, JSON.parse(json));
        },
        error   : function(jqXHR, textStatus, err) {
          cb(err);
        }
      });
    }


    function loadDocs(id, cb) {
      $.ajax({
        url     : common.config.domain + '/doc/load-collection/' + id + '/',
        data    : {},
        success : function (json) {
          cb(null, JSON.parse(json));
        },
        error   : function(jqXHR, textStatus, err) {
          cb(err);
        }
      });
    }


    return {
      deleteDoc             : deleteDoc,
      getNotes              : getNotes,
      getPlayerType         : getPlayerType,
      loadDocs              : loadDocs,
      loadDocumentById      : loadDocumentById,
      loadDocumentByVideoId : loadDocumentByVideoId,
      loadVideos            : loadVideos,
      player                : player,
      saveDoc               : saveDoc,
      setPlayerType         : setPlayerType
    };

  }());

});
