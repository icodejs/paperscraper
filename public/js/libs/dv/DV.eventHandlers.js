
define(['Underscore', 'Common', 'User', 'Video', 'App', 'UI', 'IdleTimer', 'Tagz'], function(_, common, user, video, app, UI, idleTimer, tagz) {

  var DV = DV || {}, $ = common._$, c = common._con;

  return DV.eventHandlers = (function () {
    'use strict';

    var
    el,
    moveToInpointHandler_throttled = _.throttle(moveToInpointHandler, 2000),
    resetNoteHandler_throttled     = _.throttle(resetNoteHandler, 2000);


// helper methods

    function init(elements) {
      el = elements;
    }


    function bind(cb) {
      // alert user that they may loose unsaved changes.
      el.window.on('beforeunload' , windowBeforeunloadHandler);

      // make sure external links dont trigger beforeunload. e.g. <a href="http://google.com" rel="ext">Google</a>
      el.externalLinks.on('click', externalLinksHandler);

      // load video handler
      el.loadBtn.on('click', loadVideoHandler);

      // document tile list handler
      el.docTileList.on('click', 'a', loadDocumentTileListHandler);

      // Event delegation handlers bound to the videoNotes element.
      el.videoNotes

        // save list of notes as a document to the server
        .on('click', '.save', saveDocumentHandler)

        // removed saved notes
        .on('click', '.delete', deleteVideoNoteHandler)

        // edit saved notes
        .on('click', '.edit', editVideoNoteHandler)

        // move video to saved inpoint
        .on('click', '.goto, .savedNoteText a', gotoVideoInpointHandler)

        // sort saved notes (not needed as notes are auto sorted)
        // .on('click', '.sort', sortHandler)

        // give the user a read-only link that they can share with others.
        .on('click', '.share', shareHandler)

        // export as HTML to be added to blog or email
        .on('click', '.export', exportHandler)

        // close a message before it fades out
        .on('click', '.close', messageCloseHandler)

        // save list of notes as a document to the server
        .on('click', '.new', newDocumentHandler)

        // delete document currently being editted
        .on('click', '.delete', deleteBtnClickHandler);


      idleTimer.subscribe('idle', function () {
        // You have been idle for a while now! Auto save will commence in 10 seconds (Ok, Cancel).
      });
      idleTimer.subscribe('active', function () {
        // active
      });
      idleTimer.start(60000);

      if (cb) cb();
    }


    function setupControls(jQHash) {
      var o = { jQHash: jQHash }, shortcuts = [];

      // Note text - listen for focus, blur and carriage return
      jQHash.note
        //.on('focus', o, noteFocusHandler)
        .on('blur', o, noteBlurHandler)
        .on('keypress', o, common.throttle(function (e) {
          noteReturnKeyHandler(e);
        }, 250))
        .on('keydown', o, common.throttle(function (e) {
          setInPointOnNoteKeydownHandler(e);
        }, 250));

      // slider change (may be depricated in favor of HTML5 input="number")
      //jQHash.adjust.on('change', o, adJustInpointHandler);

      // goto button click
      jQHash.jumpTo.on('click', o, moveToInpointHandler).tooltip();

      // add new note.
      jQHash.add.on('click', o, addNoteHandler).tooltip();

      // reset and clear new note.
      jQHash.reset.on('click', o, resetNoteHandler).tooltip();

      // toggle play pause video
      jQHash.togglePlay.on('click', o, togglePlayPause).tooltip();

      shortcuts.push('<small>Ctrl + Shift + U : Toggle Play / Pause</small><br>');
      shortcuts.push('<small>Ctrl + Shift + I : Video to in point</small><br>');
      shortcuts.push('<small>Ctrl + Shift + O : Clear / Reset note</small><br>');
      shortcuts.push('<small>Ctrl + Shift + J : Cursor to in point</small><br>');
      shortcuts.push('<small>Ctrl + Shift + K : Cursor to tags</small><br><br>');
      shortcuts.push('<p><small><strong>Note:</strong> These shortcuts only work when the notes field below is in foucs.</small></p>');

      jQHash.keyboardShortcuts.on('click', function (e) {
        e.preventDefault();
      }).popover({
        content: shortcuts.join(''),
        placement: 'left'
      });
    }


    function reattachSetInPointOnNoteKeydownHandler(jQHash) {
      jQHash.note.on('keydown', { jQHash: jQHash }, common.throttle(function (e) {
        setInPointOnNoteKeydownHandler(e);
      }, 250));
    }


    function addUpdateNote(jQHash, mouseClick) {
      var
      editNoteId = (+el.newNoteContainer.attr('data-editnoteid')) || 0,
      inpoint    = jQHash.inPoint.val().length ? (+jQHash.inPoint.val()) : -1,
      note       = jQHash.note, // script injection removal
      len        = $.trim(note.val()).length,
      docId      = (+el.formNotes.data('docid')) || -1,
      isAutoSave = el.autoSave.is(':checked') && docId > 0;

      if (inpoint === -1 || !len) return note.val('');

      if (editNoteId > 0) {
        app.updateNote(editNoteId, function () {
          if (isAutoSave) autoSave();
        });
      }
      else {
        app.addNote(jQHash, mouseClick, function () {
          var $items = el.savedNotesContainer.find('.savedNote');

          app.notesCollection = app.sortNotes(app.notesCollection);
          el.savedNotes.html(app.sortNotesUI($items));
          if (isAutoSave) autoSave();
        });
      }
      reattachSetInPointOnNoteKeydownHandler(jQHash);
    }


    function autoSave() {
      setTimeout(function () {
        saveDocument(true);
      }, 1000);
    }


    function saveDocument(isAutoSave, cb, e) {
      var o;

      if (!app.user && !app.user.length) {
        return UI.displayMessage({
          text : 'No logged in user.',
          type : 'error'
        });
      }

      o = app.getDocumentObject();

      video.saveDoc(o, function(err, doc) {
        if (err) return UI.displayMessage({ text: err, type: 'error' });

        el.formNotes.attr({ 'data-id': doc.id, 'data-docid': doc.docId });
        el.documentTitle.val(doc.title);
        el.shareBtn.show();
        el.exportBtn.show();
        el.newBtn.show();
        el.deleteBtn.show();

        if (o.id === -1) {
          video.loadDocs(app.user.id, function(err, arr) {
            if (err) return UI.displayMessage(err, 'error');
            UI.updateDocumentTileUI(arr, app.fadeSpeed);
          });
        }

        app.unsaveNoteCount = 0;

        if (isAutoSave) {
          if (cb) cb();
          return;
        }
        else {
          UI.scrollTo({
            position: el.videoNotes.offset().top - 20,
            callback: function () {
              UI.displayMessage({
                text : 'Document "' + doc.title + '" saved successfully.',
                type : 'success'
              });
              if (cb) return cb();
            }
          });
        }
      });
    }


// event methods

    // function sortHandler(e) {
    //   e.preventDefault();
    //   var $items = el.savedNotesContainer.find('.savedNote');

    //   if ($items.length < 2)
    //     return UI.displayMessage({ text: 'There are not enough notes to sort.', type: 'error' });

    //   el.savedNotes.html(app.sortNotesUI($items));
    // }


    function shareHandler(e) {
      e.preventDefault();
      var
      share = common._window.location.origin + '/d/' + el.formNotes.data('docid'),
      link  = '<a href="' + share + '" target="_blank">' + share + '</a>';
      UI.scrollTo({
        callback: function () {
          UI.displayMessage({
            text    : 'Your share url is: ' + link,
            type    : 'success',
            timeout : 7000
          });
        }
      });
    }


    function loadVideoHandler(e) {
      e.preventDefault();
      var url = el.url.val(), obj = video.getPlayerType(url);

      if (el.savedNotes.children().length || el.newNoteContainer.children().length)
        app.reset();

      app.loadVideo(obj, function () {
        app.loadNewNoteUI(setupControls);
      });
    }


    function loadDocumentTileListHandler(e) {
      e.preventDefault();
      var videoId = $(e.currentTarget).data('id');

      video.loadDocumentByVideoId(videoId, function (err, o) {
        if (err) return UI.displayMessage(err, 'error');

        UI.getSavedNotesTemplate(o.notes, false, function ($html) {
          var setupUI = _.once(function () {
            el.savedNotes.html($html);
            el.savedNotesContainer.fadeIn(app.fadeSpeed);
            el.shareBtn.show();
            el.exportBtn.show();
            el.newBtn.show();
            el.deleteBtn.show();
            el.buttonContainer.show();
          }),
          tagzConfig = $.extend(app.config.tagz, {tags : o.tags});

          app.notesCollection = o.notes;
          app.reset(false);

          el.category.val(o.category);
          el.tags.tagz(tagzConfig);
          el.formNotes
            .find('#documentTitle')
            .val(o.title)
          .end()
            .attr({
              'data-id'   : o.id,
              'data-docid': o.docId || common.getId()
            });

          app.loadVideo({
            id       : o.videoSummary.id,
            typeName : o.videoSummary.typeName
          },
          function () {
            app.loadNewNoteUI(setupControls);
            setupUI();
          }); // end loadVideo

        }); // end getSavedNotesTemplate
      }); // end loadDocumentByVideoId
    }


    function deleteVideoNoteHandler(e) {
      e.preventDefault();
      var
      $this      = $(e.currentTarget),
      $container = $this.closest('.savedNote'),
      inpoint    = $container.find('.noteInpoint').data('inpoint');

      $container.fadeOut(app.fadeSpeed, function () {
        $(this).remove();
        common.removeItemByValue(app.notesCollection, inpoint, 'inPoint', function (arr) {
          app.notesCollection = arr;
        });
      });
    }


    function editVideoNoteHandler(e) {
      e.preventDefault();
      var
      $this      = $(e.currentTarget),
      $container = $this.closest('.savedNote'),
      inpoint    = Math.floor(+$container.find('.noteInpoint').data('inpoint')),
      noteText   = $container.find('.savedNoteText').text(),
      noteId     = $container.attr('id');

      if (video.player) {
        UI.scrollTo({
          callback  : function () {
            var nc = el.newNoteContainer;
            video.player.seekTo(inpoint, true);
            nc.find('.inPoint').val(inpoint);
            nc.find('.adjust').val(inpoint);
            nc.find('.note').val(noteText);
            nc.attr({'data-editnoteid': noteId});
          }
        });
      }
    }


    function gotoVideoInpointHandler(e) {
      e.preventDefault();
      var
      $this      = $(e.currentTarget),
      $container = $this.closest('.savedNote'),
      inpoint    = $container.find('.noteInpoint').data('inpoint');

      if (video.player) {
        UI.scrollTo({
          callback  : function () { video.player.seekTo(inpoint, true); }
        });
      }
    }


    function newDocumentHandler(e) {
      e.preventDefault();
      common._window.location.replace('/your-docs');
    }


    function saveDocumentHandler(e) {
      e.preventDefault();
      saveDocument(false);
    }


    function adJustInpointHandler(e) {
      e.data.jQHash.inPoint.val($(e.currentTarget).val());
    }


    function moveToInpointHandler(e) {
      e.preventDefault();
      var val = e.data.jQHash.inPoint.val() || 0;

      if (val) {
        video.player.seekTo(val);
        e.data.jQHash.note.focus();
      }
      else {
        UI.displayMessage({
          text : 'Please set an in point. This can be achieved by typing a note.',
          type : 'warning'
        });
      }
    }


    function noteBlurHandler(e) {
      var
      $note    = $(e.currentTarget),
      $inPoint = e.data.jQHash.inPoint,
      $shortcuts = e.data.jQHash.keyboardShortcuts;

      if (!$note.val().length) {
        $shortcuts.fadeOut();
        $inPoint.val('');
        $note.on('keydown', e.data, common.throttle(function (evt) {
          setInPointOnNoteKeydownHandler(evt);
        }, 100));
      }
    }


    function noteReturnKeyHandler(e) {
      // http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
      var
      keycode  = e.keyCode || e.which,
      $note    = $(e.currentTarget),
      $inPoint = e.data.jQHash.inPoint;

      if (keycode === 13) {
        e.preventDefault();
        return addUpdateNote(e.data.jQHash, false);
      }
      // ctrl + shift + U (Toggle play / pause)
      if (e.ctrlKey && e.shiftKey && keycode === 21) {
        if ($note.val().length && $inPoint.val().length) {
          togglePlayPause(e);
        }
      }
      // ctrl + shift + I (Back to in point)
      if (e.ctrlKey && e.shiftKey && keycode === 9) {
        moveToInpointHandler_throttled(e);
      }
      // ctrl + shift + O (Clear / reset)
      if (e.ctrlKey && e.shiftKey && keycode === 15) {
        resetNoteHandler_throttled(e);
      }
      // ctrl + shift + J (Go to in point)
      if (e.ctrlKey && e.shiftKey && keycode === 10) {
        e.data.jQHash.inPoint.focus();
      }
      // ctrl + shift + K (Go to tags)
      if (e.ctrlKey && e.shiftKey && keycode === 11) {
        el.tags.focus();
      }
      //common.getKeyCodeInfo(e);
    }


    function togglePlayPause(e) {
      e.preventDefault();
      video.player.toggle();
    }


    function setInPointOnNoteKeydownHandler(e) {
      var
      keycode    = e.keyCode || e.which,
      $note      = $(e.currentTarget),
      $inPoint   = e.data.jQHash.inPoint,
      $shortcuts = e.data.jQHash.keyboardShortcuts,
      suitable   = (!$inPoint.val().length || (+$inPoint.val()) <= 0);

      if (video.player && $note.val().length && suitable) {
        video.player.getCurrentTime(function (value) {
          e.data.jQHash.note.off('keydown');
          $inPoint.val(Math.ceil(value));
          $shortcuts.fadeIn();
        });
      }
    }


    function addNoteHandler(e) {
      e.preventDefault();
      addUpdateNote(e.data.jQHash, true);
    }


    function resetNoteHandler(e) {
      e.preventDefault();
      app.resetNewNote(e.data.jQHash);
      reattachSetInPointOnNoteKeydownHandler(e.data.jQHash);
    }


    function exportHandler(e) {
      e.preventDefault();

      var
      html     = [],
      doc      = app.getDocumentObject(),
      videoUrl = common.config.youtubeUrl + doc.videoId;

      html.push('<div class="docuvidDocument">');
        html.push('<h3>' + doc.docTitle + '</h3>');
        html.push('<h3>Created by: ' + doc.userId + '</h3>');
        html.push(video.player.getVideoEmbedCode());
        html.push('<div class="notes">');
          _.each(doc.notes, function (n, i) {
            var inpoint = Math.floor(n.inPoint), url = videoUrl + '#t=' + inpoint + 's';
            html.push('<div class="note">');
              html.push('<p>' + n.note + '</p>');
              html.push('<p><a href="' + url + '" target="_blank">View on Youtube</a></p>');
              html.push('<p>In point: ' + common.getTimeFromSeconds(inpoint) + '</p>');
            html.push('</div><br>');
          });
        html.push('</div>');
      html.push('</div>');

      UI.scrollTo({
        position: el.videoNotes.offset().top - 20,
        callback: function () {
          var markup = [];
          markup.push('<h2>Copy HTML:</h2>');
          markup.push('<pre><code>');
          markup.push(_.escape(html.join('')));
          markup.push('</code></pre>');

          return UI.displayMessage({
            text       : markup.join(''),
            type       : 'info',
            timeout    : 10000,
            hidePrefix : true
          });
        }
      });
    }


    function externalLinksHandler(e) {
      common._window.onbeforeunload = null;
    }


    function windowBeforeunloadHandler (e) {
      if (app.unsaveNoteCount > 0) {
        var msg = 'You have ' + app.unsaveNoteCount + ' unsaved note(s).';

        setTimeout(function () {
          UI.scrollTo({
            callback: function () {
              UI.displayMessage({
                text    : 'You may want to save your changes before leaving this page',
                type    : 'warning',
                timeout : 7000
              });
            }
          });
        }, 500);

        return msg;
      }
    }


    function messageCloseHandler(e) {
      e.preventDefault();
      el.messageContainer.fadeOut();
    }


    function deleteBtnClickHandler(e) {
      // Idea:
      // may want to reuse this dialog and set thing up depending on the use case.
      // 1. set content, heading, button text / style.
      // 2. set which method is executed depending on the use case.
      // 3. unbind old events and set new ones. $._data(element[0], ‘events’);

      e.preventDefault();

      var docId = el.formNotes.data('id'), $modalDelete = $('.modalDelete');

      el.modalDialog
        .modal('show')
        .on('click', '.modalDelete', function (e) {
          $modalDelete.attr('disabled', 'disabled').find('span').text('please wait...');

          video.deleteDoc(docId, function (id) {
            // remove element from doc list with in the UI.
            // redirect back to current page or reset. (Which ever is cleanest)
            app.currentVideo.destroy();
            app.reset(true, function () {
              $modalDelete.removeAttr('disabled').find('span').text('Delete');
              el.modalDialog.modal('hide');
            });
          });
        })
        .find('div.modal-body p')
          .html('Are you sure you want to delete? <br><strong>' + el.documentTitle.val() + '</strong> <br><br> This document will be permanently deleted!');
    }


    return {
      bind : bind,
      init : init
    };

  }());

});
