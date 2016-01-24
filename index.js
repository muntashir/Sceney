var sceney = require('./sceney');

function init(clarifaiKeys, readyCallback) {
  return new sceney(clarifaiKeys, readyCallback);
}

exports.init = init;