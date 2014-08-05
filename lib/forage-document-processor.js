var fs = require('fs');
var urllib = require('url');
var async = require('async');
var program = require('commander');
var path = require('path');
var concurrencyLimit = 8; // number of concurrent tasks

program
    .version('0.2.4')
    .option('-f, --fetchdirectory <fetchdirectory>', 'specify the fetch directory,' + ' defaults to crawl/fetch/ (MUST END WITH SLASH /)',
        String, 'fetch/')
    .option('-d, --documentdirectory <documentdirectory>', 'specify the document directory,' + ' defaults to crawl/doc/ (MUST END WITH SLASH /)',
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

// the task to perform

// create a queue object with concurrency 2
var q = async.queue(function(task, callback) {
    console.log('start processing ' + task);
    processFile(task, callback);
}, concurrencyLimit);


q.drain = function() {
    console.log('all items have been processed');
};

var scan = function(dir) {
    console.log("directory " + dir);
    fs.readdir(dir, function(err, files) {
        var returnFiles = 0;
        async.each(files, function(file, next) {

            var filePath = dir + '/' + file;
            filePath = filePath.replace(/\/\//, '/');
            fs.stat(filePath, function(err, stat) {
                if (err) {
                    return next(err);
                }
                if (stat.isDirectory()) {
                    scan(filePath, function(err, results) {
                        if (err) {
                            return next(err);
                        }
                        next();
                    })
                } else if (stat.isFile()) {

                    q.push(filePath, function() {
                        console.log('running finished with ' + filePath);
                    });
                    next();
                }
            });
        });
    })
};

function processFile(file, callback) {
    fs.readFile(file, function(err, data) {
        if (err) {
            console.log(err, file);
            return;
        }
        var html = data.toString();
        if (!html) {
            console.log('weirdness');
            return;
        }
        adapter.parse(file, html, function(batch) {
            if (batch) {
                var saved = fs.writeFileSync(docdir + path.basename(file), JSON.stringify(batch), 'utf8');
            }
            callback();
        });

    });
    
}


scan(fetchdir);
