
var
resourceful = require('resourceful'),
conf        = require('./config'),
dbFunctions = require('./dbFunctions'),
publicFuncs = {};

var WebPage = resourceful.define('webPage', function (id) {
  this.use('couchdb', {
    uri: conf.couchDB.webPage
  });

  this.string('_id');
  this.string('id');
  this.string('category');
  this.string('url');
  this.timestamps();
});


function saveBatch(arr) {
  l = arr.length;
  w = arr[len -1];

  create({
    category: w.category,
    url: w.url
  }, function (err, doc) {
      if (err)  {
        console.log(err);
      } else {
        console.log('success: ', w);
        console.log(l);

        if (l > 1) {
          var obj = arr.pop();
          saveBatch(arr);
        }

      }
  });
}


publicFuncs           = dbFunctions.get(WebPage);
publicFuncs.saveBatch = saveBatch;

module.exports        = publicFuncs;
