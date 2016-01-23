var sceney = require('./sceney');

function init(clarifaiKeys, redisUrl) {
    return new sceney(clarifaiKeys, redisUrl);
}

exports.init = init;