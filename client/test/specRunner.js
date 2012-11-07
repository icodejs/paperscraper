require.config({
  paths: {
    jQuery     : '/js/libs/jquery/jquery',
    Underscore : '/js/libs/underscore/underscore',
    Backbone   : '/js/libs/backbone/backbone',
    URI        : '/js/libs/URI/uri',
    FitVids    : '/js/libs/jquery/jquery.fitvids.min',
    Text       : '/js/libs/require/text',
    domReady   : '/js/libs/require/domReady',
    Common     : '/js/libs/dv/DV.common',
    User       : '/js/libs/dv/DV.user',
    Video      : '/js/libs/dv/DV.video',
    Youtube    : '/js/libs/dv/DV.video.youtube',
    App        : '/js/libs/dv/DV.app',
    UI         : '/js/libs/dv/DV.UI',

    // test files
    TestCommon : 'spec/testCommon',
    TestFake   : 'spec/testFake',
    Fake       : 'spec/fake' // in future this will be a real module in the js dir
  }
});

require(['domReady!', 'TestCommon', 'TestFake'], function(document, testCommon, testFake) {
  var jasmineEnv = jasmine.getEnv();
  jasmineEnv.updateInterval = 1000;

  var htmlReporter = new jasmine.HtmlReporter();
  jasmineEnv.addReporter(htmlReporter);

  jasmineEnv.specFilter = function(spec) {
    return htmlReporter.specFilter(spec);
  };

  jasmineEnv.execute();
});

