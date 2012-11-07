
/**
 * jQuery Tagz Plugin (Delicious style tag textbox with tag list)
 * https://github.com/icodejs/jquery.tagz
 *
 * @version 1.0
 * @copyright Copyright (C) 2012 Jay Esco. All rights reserved.
 * @license MIT License
 */

(function($, undefined) {
  'use strict';

  $.fn.tagzApplied = false;

  $.fn.tagz = function(options) {

    if (!this.length) return this;

    var
    $tagzContainer,
    $tagzArr,
    tagzArr = [],
    opts = $.extend(true, {}, $.fn.tagz.defaults, options);

    // Stop plugin from being initialised twice but allow defaults to be updated.
    if (!$.fn.tagzApplied) {
      $tagzContainer = $('<' + opts.tagOuterWrap + ' />').addClass('tagz clearfix');
      $tagzArr       = $('<input type="hidden" />').addClass('savedTags');
    }
    else if (opts.resetIfApplied) {
      $tagzContainer = $('.tagz');
      $tagzArr       = $('.savedTags');
    }
    else {
      return this;
    }


    return this.each(function() {
      var $this = $(this);

      $.fn.tagzApplied = $this.is('.applied');

      if ($.fn.tagzApplied && opts.resetIfApplied) {
        reset($this, $tagzContainer, $tagzArr);
      }
      init($this);
    });


    function init($this) {
      $this
        .addClass('applied')
        .after($tagzArr)
        .after($tagzContainer)
        .on('keydown', function (e) {
          var keycode = e.keyCode || e.which, tag = '';

          if (keycode === 13) {
            e.preventDefault();
            tag = cleanTag($this);

            if (tag.length > 1 && !contains(tagzArr, tag)) {
              setupRemoveClickHandler([tag], $tagzContainer, removeTagHandler);
              $this.val('');
            }
          }
        });

      if (opts.tags.length) {
        setupRemoveClickHandler(opts.tags, $tagzContainer, removeTagHandler);
      }
    }


    function setupRemoveClickHandler(tags, $container, fn) {
      var i, len = tags.length, tag = '';

      for (i = 0; i < len; i += 1) {
        tag = tags[i];
        $('<' + opts.tagInnerWrap +  '/>')
          .html('<span><a href="#" title="close"><img src="' + opts.closeImage + '" class="' + opts.closeClass + '" /></a></span>')
          .addClass(opts.tagClass)
          .hide()
            .find('a')
              .on('click', fn)
          .end()
            .find('span')
              .prepend(tag)
          .end()
          .appendTo($container)
          .fadeIn(opts.fadeSpeed);

        tagzArr.push(tag);
        $tagzArr.val(JSON.stringify(tagzArr.sort()));
      }
    }


    function reset($this) {
      $('.tagz').remove();
      $('.savedTags').remove();
    }


    function removeTagHandler(e) {
      e.preventDefault();

      var $container = $(e.currentTarget).closest(opts.tagInnerWrap);
      $container.fadeOut(opts.fadeSpeed, function () {
        var $this = $(this).remove(), t = $.trim($this.find('span').text());
        removeItem(tagzArr, t);
        $tagzArr.val(JSON.stringify(tagzArr.sort()));
      });
    }


    function contains(arr, tag) {
      var i, len = arr.length;
      if (len) {
        for (i = 0; i < len; i += 1) {
          if (arr[i] === tag) return true;
        }
      }
      return false;
    }


    function escapeHTML(str) {
      var entityMapEscape = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      },
      entityMapRemove = {
        "&": '',
        "<": '',
        ">": '',
        '"': '',
        "'": '',
        "/": ''
      },
      map = opts.escape ? entityMapEscape : entityMapRemove;

      return String(str).replace(/[&<>"'\/]/g, function (s) {
        return map[s];
      });
    }


    function cleanTag($dirty) {
      var clean;
      clean = $dirty.val();
      clean = clean.toLowerCase();
      clean = escapeHTML(clean);
      clean = $.trim(clean);
      return clean;
    }


    function removeItem(arr, tag) {
      var i, len = arr.length;
      for (i = 0; i < len; i += 1) {
        if (arr[i] === tag) {
          arr.splice(i, 1);
        }
      }
    }


  }; // end plugin


  $.fn.tagz.defaults = {
    tags           : [],
    tagOuterWrap   : 'ul',
    tagInnerWrap   : 'li',
    closeImage     : '',
    fadeSpeed      : 250,
    tagClass       : 'tag',
    closeClass     : 'close',
    escapeInput    : false,
    resetIfApplied : false
  };

} (jQuery));
