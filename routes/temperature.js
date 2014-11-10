
/*
 * GET temperatures listing.
 */

var util = require('util')
  , redis = require('redis')
  , client = redis.createClient();

var EventEmitter = require('events').EventEmitter;
var ev = new EventEmitter();

// redis.debug_mode = true;

client.on('error', function(e){
  util.log('redis_err ' + String(e))
});

exports.handler = function(req, res){
  var newTemperature = {};
  var celsius = req.body.celsius;
  newTemperature.celsius = parseFloat(celsius);
  newTemperature.datetime = new Date();
  client.rpush("temperature", JSON.stringify(newTemperature));
  client.exists("command", function(err, rexists){
    if (rexists == 1) {
      client.get("command", function(err, rget){
        res.send("command: " + rget + "\n");
      });
      client.del("command");
    } else {
      res.send("no command\n");
    }
  });
  ev.emit('data', celsius);
};

exports.list = function(req, res){
  client.llen("temperature", function(err, rllen){
    client.lrange("temperature", 0, rllen, function(err, rlrange){
      var list = rlrange.map(function(x){
        return JSON.parse(x);
      });
      res.send(JSON.stringify(list));
    });
  });
};

exports.command = function(req, res){
  client.set("command", req.body.command);
  res.send();
};

exports.monitor = function(req, res){
  ev.on('data', function(value){
    res.write('data: ' + value + '\n\n');
  });
  res.writeHead(200, {
    'Content-Type' : 'text/event-stream',
    'Cache-Control' : 'no-cache',
    'Connection' : 'keep-alive'
  });
  res.write('\n');
};