
define(['Common', 'Underscore', 'Text!Note.html', 'Text!SavedNote.html', 'Text!Videos.html', 'Text!Docs.html'], function (common, _, notesTemplate, savedNoteTemplate, videosTemplate, docsTemplate) {
  var  DV = DV || {};

  return DV.UI = (function () {
    'use strict';

    var
    controls,
    $     = common._$,
    c     = common._con,
    state = 'clean',
    alertType = {
      error   : { klass: 'alert-error'   , prefix: '<strong>Error!</strong> ' },
      success : { klass: 'alert-success' , prefix: '<strong>Success!</strong> ' },
      info    : { klass: 'alert-info'    , prefix: '<strong>Info!</strong> ' },
      warning : { klass: 'alert-block'   , prefix: '<strong>Warning!</strong> ' }
    },
    templateControls = [
      '.add', '.adjust', '.inPoint', '.jumpTo', '.note', '.noteId', '.remove',
      '.reset', 'legend', '.togglePlay', '.keyboardShortcuts'
    ];


    function init(config) {
      var c = config.covert;
      if (c.is) {
        controls.body.addClass(c.klass);
      }
    }


    function getPageElements() {
      DV.UI.controls = controls = {
        ajaxLoader          : $('.ajaxLoader'),
        autoSave            : $('.autoSave'),
        body                : $('html, body'),
        buttonContainer     : $('.buttonContainer'),
        category            : $('.category'),
        deleteBtn           : $('.delete'),
        docTileList         : $('.docTileList'),
        documentTitle       : $('#documentTitle'),
        exportBtn           : $('.export'),
        externalLinks       : $('a[rel=ext]'),
        formNotes           : $('.formNotes'),
        loadBtn             : $('#load'),
        messageContainer    : $('.formNotes .alert'),
        modalDialog         : $('.modalDialog'),
        newBtn              : $('.new'),
        newNoteContainer    : $('.newNoteContainer'),
        playerWrapper       : $('.playerWrapper'),
        removeBtn           : $('remove', '.formNotes'),
        saveBtn             : $('.save', '.videoNotes'),
        savedNotes          : $('.savedNotes'),
        savedNotesContainer : $('.savedNotesContainer'),
        shareBtn            : $('.share'),
        socialContainer     : $('.socialContainer'),
        sortBtn             : $('.sort', '.videoNotes'),
        tags                : $('.tags'),
        tagSearchLinks      : $('.tagSearchLinks'),
        url                 : $('#url'),
        urlContainer        : $('.urlContainer'),
        videoContainer      : $('.videoContainer'),
        videoNotes          : $('.videoNotes'),
        videoTagLine        : $('.docHeading p'),
        videoWrapper        : $('.videoWrapper'),
        window              : $(common._window)
      };
      return controls;
    }


    function loadToggle(show) {
      if (show) {
        controls.ajaxLoader.fadeIn();
      }
      else {
        controls.ajaxLoader.fadeOut();
      }
    }


    function getTemplate(itemTemplate, o) {
      var compiledTemplate = _.template(itemTemplate, o);
      //c.log(compiledTemplate);
      return $(compiledTemplate).clone();
    }


    function getNotesTemplate(arr, cb) {
      return cb(getTemplate(notesTemplate, { items: arr }));
    }


    function getSavedNotesTemplate(arr, readOnly, cb) {
      return cb(getTemplate(savedNoteTemplate, {
          items    : arr,
          readOnly : readOnly
        })
      );
    }


    function getVideoTileListTemplate(arr, cb) {
      return cb(getTemplate(videosTemplate, { items: arr }));
    }


    function getDocTileListTemplate(arr, cb) {
      return cb(getTemplate(docsTemplate, { items: arr }));
    }


    function displayMessage(opts) {
      var
      _type      = opts.type || 'warning',
      $container = controls.messageContainer.addClass(alertType[_type].klass),
      msgText    = (opts.hidePrefix ? '' : alertType[_type].prefix) + opts.text;

      $container.find('span').html(msgText);
      $container.fadeIn(500, function () {
        var $this = $(this);
        setTimeout(function () {
          $this.fadeOut(500, function () {
            controls.messageContainer.removeClass(alertType[_type].klass);
          });
        }, opts.timeout || 5000);
      });
    }


    function scrollTo(opts) {
      opts = opts || {};
      controls.body.animate(
        { scrollTop: opts.position || controls.videoContainer.offset().top - 20 },
        opts.speed || 'slow',
        function () {
          if (opts.callback) opts.callback();
        }
      );
    }


    function updateDocumentTileUI(arr, fadeSpeed) {
      if (arr.length) {
        getDocTileListTemplate(arr, function ($html) {
          controls.docTileList.html($html).fadeIn(fadeSpeed);
        });
      }
    }


    return {
      controls                 : controls,
      displayMessage           : displayMessage,
      getDocTileListTemplate   : getDocTileListTemplate,
      getNotesTemplate         : getNotesTemplate,
      getPageElements          : getPageElements,
      getSavedNotesTemplate    : getSavedNotesTemplate,
      getVideoTileListTemplate : getVideoTileListTemplate,
      init                     : init,
      loadToggle               : loadToggle,
      scrollTo                 : scrollTo,
      state                    : state,
      templateControls         : templateControls,
      updateDocumentTileUI     : updateDocumentTileUI
    };

  }());

});
