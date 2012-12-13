
/*
 * GET temperatures listing.
 */

var util = require('util')
  , redis = require('redis')
  , client = redis.createClient();

// redis.debug_mode = true;

client.on('error', function(e){
  util.log('redis_err ' + String(e))
});

exports.handler = function(req, res){
  var newTemperature = {};
  newTemperature.celsius = parseFloat(req.body.celsius);
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
};
