var clarifai = require('./clarifai_node');
var three_net = require('3net.js');

sceney.prototype.rateImage = function (image) {
    return 0;
}

function sceney(clarifaiKeys, redisUrl) {
    if (redisUrl) {
        var redisUrl = require('url').parse(redisUrl);
        db = redis.createClient(redisUrl.port, redisUrl.hostname, {
            no_ready_check: true
        });
        db.auth(redisUrl.auth.split(":")[1]);
    } else {
        db = redis.createClient();
    }
}

module.exports = sceney;