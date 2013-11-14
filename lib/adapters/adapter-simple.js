var cheerio = require('cheerio');

exports.parse = function (file, html, callback) {
  var $ = cheerio.load(html);
  var doc = {};
  $("meta").each(function(i, e) {
    var meta = $(e);
    console.log(meta.attr('name'));
    doc[meta.attr('name')] = meta.attr('content');
  });
  $("title").each(function(i, e) {
    var title = $(e);
    doc['title'] = title.text();
  });
  $("div.entry-content").each(function(i, e) {
    var body = $(e);
    doc['body'] = body.text().replace(/\s+/g, ' ');
  });
  var batch = {};
  batch[file] = doc;
  callback(batch);
}
