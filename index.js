var sceney = require('./sceney');

function init(clarifaiKeys) {
  return new sceney(clarifaiKeys);
}

exports.init = init;