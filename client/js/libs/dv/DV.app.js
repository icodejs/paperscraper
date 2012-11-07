
define(['Common', 'User', 'UI', 'Video', 'Underscore', 'URI', 'Ddate', 'Tagz'], function(common, user, UI, video, _, URI, Ddate, tagz) {

  var DV = DV || {};

  return DV.app = (function () {
    'use strict';

    var
    unsaveNoteCount = 0,
    notesCollection = [],
    $               = common._$,
    c               = common._con,
    _user           = null,
    _fadeSpeed      = 750,
    _URI            = null,
    el              = null,
    _video          = null,
    currentVideo    = null,

    config = {
      covert : {
        klass : 'covert',
        is    : false
      },
      tagz : {
        closeImage     : '/img/glyphicons_207_remove_2.png',
        closeClass     : 'rmv',
        tagOuterWrap   : 'ul',
        tagInnerWrap   : 'li',
        resetIfApplied : true
      }
    };


    function init(elements, cb) {
      el = elements;

      // jQuery ajax setup
      $.ajaxSetup({
        type     : 'GET',
        cache    : false,
        dataType : 'json'
      });

      $.xhrPool = [];
      $.xhrPool.abortAll = function () {
        $(this).each(function (idx, jqXHR) {
          jqXHR.abort();
        });
        $.xhrPool.length = 0;
      };

      /**
       * jQuery global function that keep a record of all ajax requests
       * and provide a handly way of aborting them all at any given time.
       */
      $.ajaxSetup({
        beforeSend: function (jqXHR) {
          UI.loadToggle(true);
          $.xhrPool.push(jqXHR);
        },
        complete: function (jqXHR) {
          UI.loadToggle(false);
          var index = $.xhrPool.indexOf(jqXHR);
          if (index > -1) {
            $.xhrPool.splice(index, 1);
          }
        }
      });

      // Underscore setup
      _.templateSettings.variable = 'tmp';

      getLoadType(function (loadType) {
        if (loadType && loadType === 'readOnly') {
          return cb(null, {
            id       : DV.app.URI.path().split('/')[2],
            loadType : loadType
          });
        }
      });

      user.current(function (err, o) {
        if (err) {
          cb(err);
        }
        else {
          DV.app.user = o;
          cb();
        }
      });

    } // end init


    function getLoadType(cb) {
      var
      url       = common._window.location.href,
      _URI      = new URI(url),
      pathParts = _URI.directory().split('/'),
      mode      = pathParts[1] === 'd' ? 'readOnly' : null;

      DV.app.URI = _URI;
      cb(mode);
    }


    function setupVideo(firstLoad, id, cb) {
      UI.loadToggle(false);
      el.formNotes.attr('videoId', id);
      el.videoContainer.fadeIn(2000);
      if (cb) cb();

      return UI.scrollTo({
        callback : function () {
          _video.play();
          el.newNoteContainer.find('.note').focus();
        }
      });
    } // end setupVideo


    function reset(full, cb) {
      var
      el =  UI.controls || UI.getPageElements();

      el.savedNotesContainer.hide();
      el.buttonContainer.hide();
      el.savedNotes.children().remove();//.html('');
      el.documentTitle.val('');
      el.newNoteContainer.find('.inPoint').val('');
      el.newNoteContainer.find('.note').val('');
      el.newNoteContainer.find('.adjust').val('');
      notesCollection = [];

      // reset tagz
      $('.tagz').remove();
      $('.savedTags').remove();

      if (full) {
        el.videoContainer.hide();
        el.newNoteContainer.hide();
        el.formNotes.data({ id : '', docid: '' }).attr({ videoid : '' });

        video.loadDocs(DV.app.user.id, function(err, arr) {
          if (err) return UI.displayMessage(err, 'error');
          UI.updateDocumentTileUI(arr, _fadeSpeed);
          if (cb) cb();
        });
      }
      else {
        if (cb) cb();
      }
    }


    function loadVideo(o, cb) {
      var playerSwitch = (_video && _video.typeName !== o.typeName);
      if (o.id) {
        if (playerSwitch) {
          _video.destroy();
        }

        DV.app.currentVideo = _video = video.setPlayerType(o.typeName);
        _video.loadPlayer({
          videoId         : o.id,
          iframeId        : 'video',
          wrappingElement : el.playerWrapper,
          cb: function(firstLoad) {
            setupVideo(firstLoad, o.id, cb);

            if (typeof(el.videoWrapper.fitVids) === 'undefined') {
              return UI.displayMessage({
                text: 'Warning! Unable to scale video. Please reload and try again.',
                type: 'warning'
              });
            } else {
              el.videoWrapper.fitVids();
            }
          }
        });
      }
    } // end loadVideo


    function resetNewNote(jQHash) {
      jQHash.note.val('').focus();
      jQHash.inPoint.val('').attr({ min: 0, max: _video.getDuration() });
      jQHash.adjust.val('').attr({ min: 0, max: _video.getDuration() });
      el.newNoteContainer.attr('data-editnoteid', 0);
    }


    function createUser(un, em) {
      user.save({
        username : un,
        email    : em
      }, function(err, o) {
        return UI.displayMessage({
          text: 'User save successfully: ' + JSON.stringify(o),
          type: 'error'
        });
      });
    }


    function loadReadOnlyDocument(docId) {
      video.loadDocumentById(docId, function (err, o) {
        if (err)
          return UI.displayMessage({ text: err, type: 'error' });

        UI.getSavedNotesTemplate(o.notes, true, function ($html) {
          reset();
          el.formNotes
            .find('#documentTitle')
            .val(o.title)
            .attr('readonly', 'readonly')
          .end()
            .attr({
              'data-id': o.id, // couchdb id
              'data-docid': o.docId || common.getId()
            });

          loadVideo({
            id       : o.videoSummary.id,
            typeName : o.videoSummary.typeName
          },  function () {
            el.savedNotes.html($html);
            el.videoWrapper.fadeIn(_fadeSpeed);
            el.savedNotesContainer.fadeIn(_fadeSpeed);
            el.tagSearchLinks.fadeIn(_fadeSpeed);
          });
        });

      });
    } // end loadReadOnlyDocument


    function loadNewNoteUI(cb) {
      var
      fieldsetId   = 'fieldset_new',
      currTime     = _video ? _video.getCurrentTime() : 0,
      duration     = _video ? _video.getDuration() : '',
      templateData = [{
        id      : fieldsetId,
        isNew   : true,
        legend  : 'Add note',
        noteId  : common.getId(),
        inPoint : currTime,
        minIn   : 0,
        maxOut  : duration,
        note    : ''
      }];

      UI.getNotesTemplate(templateData, function ($html) {
        var jQHash = common.getJQueryObjectHash($html, UI.templateControls);
        cb(jQHash);
        jQHash.remove.hide(); // may be redundant so check!
        el.newNoteContainer.html($html).fadeIn(_fadeSpeed);
        el.documentTitle.show();
      });
    } // end loadNewNoteUI


    function updateNote(editNoteId, cb) {
      var
      jQHash, updatedNote, inpoint, note, time,
      $element = el.savedNotes.find('#' + editNoteId);

      if (editNoteId) {
        jQHash  = common.getJQueryObjectHash(el.newNoteContainer.contents(), UI.templateControls);
        inpoint = $.trim(jQHash.inPoint.val()),
        note    = $.trim(_.escape(jQHash.note.val())),
        time    = common.getTimeFromSeconds(inpoint);
        DV.app.unsaveNoteCount += 1;

        $element.find('.savedNoteText').text(note);
        $element.find('.goto span').data('inPoint', inpoint).text(time);

        updatedNote = _.find(DV.app.notesCollection, function (n) {
          return (+n.id) === editNoteId;
        });

        updatedNote.inPoint = (+inpoint);
        updatedNote.note = note;
        resetNewNote(jQHash);

        if (cb) cb();
      }
    }


   function addNote(jQHash, mouseClick, cb) {
      var
      html      = '',
      data      = {},
      note      = $.trim(_.escape(jQHash.note.val())),
      inpoint   = $.trim(jQHash.inPoint.val()),
      firstNote = !!!el.savedNotesContainer.find('.savedNote').length;

      if (!note.length) {
        return UI.displayMessage({
          text: 'Please enter some text before adding a note.',
          type: 'warning'
        });
      }

      if (!inpoint.length) {
        return UI.displayMessage({
          text: 'Please set your in point.',
          type: 'warning'
        });
      }

      data = {
        id            : common.getId(),
        inPoint       : (+inpoint),
        inPointPretty : new Date().clearTime().addSeconds(inpoint).toString('H:mm:ss'),
        note          : note
      };

      UI.getSavedNotesTemplate([data], false, function($html) {
        el.savedNotes.prepend($html);

        if (firstNote) {
          el.documentTitle.val('');
          el.savedNotesContainer.fadeIn(_fadeSpeed);
          el.buttonContainer.show();
          el.tags.tagz(config.tagz);
        }
        DV.app.notesCollection.push(data);
        resetNewNote(jQHash);
        if (cb) cb();
        //if (mouseClick) jQHash.note.val(note); // set focus but put the cursor at the end.
      });
      DV.app.unsaveNoteCount += 1;
    }


    function sortNotesUI($items) {
      return $items.sort(function(a, b) {
        var
        _a = Math.floor((+$(a).find('.noteInpoint').data('inpoint'))),
        _b = Math.floor((+$(b).find('.noteInpoint').data('inpoint')));

        if (_a > _b) return -1;
        if (_a < _b) return 1;
        return 0;
      });
    }


    function sortNotes(items) {
      return items.slice(0).sort(function (a, b) {
        if (a.inPoint > b.inPoint) return -1;
        if (a.inPoint < b.inPoint) return 1;
        return 0;
      });
    }


    function getDocumentObject() {
      var
      fn      = el.formNotes,
      tags    = el.tags.parent().find('input[type="hidden"]').val(),
      videoId = fn.attr('videoid');

      return {
        id       : fn.attr('data-id') || -1,
        docId    : fn.attr('data-docid') || common.getId(videoId),
        userId   : DV.app.user.id,
        docTitle : el.documentTitle.val(),
        videoId  : videoId,
        typeName : video.player.typeName,
        notes    : video.getNotes(DV.app.notesCollection, video.player.getDuration()),
        tags     : tags && tags.length ? JSON.parse(tags) : [],
        category : el.category.val()
      };
    }


    return {
      addNote              : addNote,
      config               : config,
      createUser           : createUser,
      currentVideo         : currentVideo,
      fadeSpeed            : _fadeSpeed,
      getDocumentObject    : getDocumentObject,
      init                 : init,
      loadNewNoteUI        : loadNewNoteUI,
      loadReadOnlyDocument : loadReadOnlyDocument,
      loadVideo            : loadVideo,
      notesCollection      : notesCollection,
      reset                : reset,
      resetNewNote         : resetNewNote,
      sortNotes            : sortNotes,
      sortNotesUI          : sortNotesUI,
      unsaveNoteCount      : unsaveNoteCount,
      updateNote           : updateNote,
      URI                  : _URI,
      user                 : _user
    };

  }());

});
