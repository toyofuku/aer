
var cronJob = require('cron').CronJob
  , redis = require('redis').createClient()
  , fs = require('fs');

var job = new cronJob({
  cronTime: "0 15 * * *"
  , onTick: function(){
    redis.lrange('temperature', 0, 1440, function(err, res){
      fs.appendFile('log/temperate.log', res.join("\n") + "\n", function(err){});
      redis.ltrim('temperature',1441, -1);
    });
  }
});

job.start();

//job.stop();