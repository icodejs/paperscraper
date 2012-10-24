
url     = require('url'),
path    = require('path'),
request = require('request'),
cheerio = require('cheerio'),
_       = require('underscored');


exports.scrapePage = function (config) {
  request(config.url, function(error, response, body) {
    var
    $ = cheerio.load(body),
    wallpapers  = [];

    $('a, img').each(function() {
      var
      $this = $(this),
      src   = $this.attr('href') || $this.attr('src');
      if (src) {
        src = src.toLowerCase();

        if (src.indexOf('jpg') >= 0 ||
            src.indexOf('png') >= 0 ||
            src.indexOf('gif') >= 0 ||
            src.indexOf('bmp') >= 0) {

          if (src.indexOf('/') === 0) src = _.ltrim(src, '/');

          wallpapers.push({
            url      : src.indexOf('http') >= 0 ? src : config.url + src,
            altText  : $this.attr('alt') || '',
            name     : $this.attr('title') || $this.text() || $this.attr('alt') || '',
            pageUrl  : config.url,
            fileName : path.basename(src),
            fileType : path.extname(src),
            domain   : url.parse(config.url).hostname || ''
          });
        }
      }
    });
    config.callback(null, wallpapers);
  });
};