
require.config({
  paths: {
    jQuery        : 'libs/jquery/jquery',
    Underscore    : 'libs/underscore/underscore',
    Backbone      : 'libs/backbone/backbone',
    URI           : 'libs/URI/uri',
    Text          : 'libs/require/text',
    Common        : 'libs/dv/DV.common',
    App           : 'libs/dv/DV.app',
    User          : 'libs/dv/DV.user',
    UI            : 'libs/dv/DV.UI',
    EventHandlers : 'libs/dv/DV.eventHandlers',
    domReady      : 'libs/require/domReady',
    Ddate         : 'libs/date/date',
    TwitterBS     : '/bootstrap/js/bootstrap.require.min',
    Cookie        : 'libs/cookie/cookie.min',
    IdleTimer     : 'libs/idle-timer/idle-timer.min',
    Tagz          : 'libs/jquery/jquery.tagz'
  },
  shim: {
    'Backbone': {
      deps: ['Underscore', 'jQuery'],
      exports: 'backbone'
    },
    'Common': {
      deps: ['Underscore', 'jQuery'],
      exports: 'common'
    },
    'Tagz': {
      deps: ['jQuery'],
      exports: 'jQuery.fn.tagz'
    }
  }
});


require([ 'domReady!'], function(doc) {

  var $ = common._$, c = common._con;


  $(function () {
    'use strict';

    // var el =  UI.controls || UI.getPageElements();

    // app.init(el, function (err, o) {

    // });

    // eventHandlers.bind(function () {

    // });

  }); // end jQuery

});
