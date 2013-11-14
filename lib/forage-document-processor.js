var fs = require('fs');
var cheerio = require('cheerio');
var urllib = require('url');

var program = require('commander');
program
  .version('0.2.3')
  .option('-f, --fetchdirectory <fetchdirectory>', 'specify the fetch directory,'
          + ' defaults to crawl/fetch/ (MUST END WITH SLASH /)',
          String, 'fetch/')
  .option('-d, --documentdirectory <documentdirectory>', 'specify the document directory,'
          + ' defaults to crawl/doc/ (MUST END WITH SLASH /)',
          String, 'doc/')
  .option('-a, --adapter <adapter>', 'specify the adapter, for example adapter-simple.js',
          String, 'adapter-simple.js')
  .parse(process.argv);

var adapter = require('./adapters/' + program.adapter);
var fetchdir = program.fetchdirectory;
var docdir = program.documentdirectory;

if (!fs.existsSync(docdir)) {
  fs.mkdirSync(docdir);
}

fs.readdir(fetchdir, function(err, files){
  if (err) throw err;
  files.forEach(function(file) {
    var html = fs.readFileSync(fetchdir + file).toString();
    if(!html) {
      console.log('weirdness');
    } else {
      adapter.parse(file, html, function(batch) {
        var saved = fs.writeFileSync(docdir + file, JSON.stringify(batch), 'utf8');
      });
    }
  });
});
