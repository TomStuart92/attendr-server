var http = require('http');
var DatabaseManager = require('./lib/databaseManager');
var databaseManager = new DatabaseManager;
var querystring = require('querystring');
var url = require('url');
var fs = require('fs');

this.server = http.createServer(function(req, res) {
  var url_parts = url.parse(req.url, true);

  if (req.url === '/') {
    fs.readFile('./views/index.html', function (err, html) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(html);
      res.end();
    });
  }

  else if (req.url === '/events' && req.method === 'GET') {
    databaseManager.getEvents().then(function(results){
      res.writeHead(200, {'Content-Type': 'JSON'});
      res.end(JSON.stringify({events: results}));
    });
  }

  else if (url_parts.pathname === '/matches' && req.method === 'GET') {
    databaseManager.getMatches(url_parts.query).then(function(results){
      res.writeHead(200, {'Content-Type': 'JSON'});
      res.end(JSON.stringify({matches: results}));
    });
  }

  else if (req.url === '/response/new' && req.method === 'POST') {
    var whole = ''
    req.on('data', (chunk) => { whole += chunk.toString() })

    req.on('end', () => {
      var params = querystring.parse(whole)
      databaseManager.addResponse(params).then(function(results){
        res.writeHead(200, {'Content-Type': 'JSON'});
        res.end();
      });
    });
  }

  else if (req.url === '/users/new' && req.method === 'POST') {
    var whole = ''
    req.on('data', (chunk) => { whole += chunk.toString() })

    req.on('end', () => {
      var params = querystring.parse(whole)
      databaseManager.addUser(params).then(function(results){
        res.writeHead(200, {'Content-Type': 'JSON'})
        res.end(JSON.stringify({user_id:results}))
      });
    });
  }

  else {
    res.writeHead(404);
    res.end();
  }
});

exports.listen = function() {
  this.server.listen.apply(this.server, arguments);
};

exports.close = function(callback) {
  this.server.close(callback);
};
