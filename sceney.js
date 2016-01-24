var three_net = require('3net.js');
var fs = require('fs');

var inputLayerTags = [
  'street',
  'travel',
  'town',
  'road',
  'city',
  'no person',
  'business',
  'shopping',
  'skyscraper',
  'traffic',
  'car',
  'downtown',
  'office',
  'modern',
  'cityscape',
  'graffiti',
  'garbage',
  'residential',
  'waste',
  'architecture',
  'calamity',
  'waste',
  'pollution'
];

function numMap(x, in_min, in_max, out_min, out_max) {
  return Math.max(in_min, (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}

sceney.prototype.rateImage = function (imageUrls, callback) {
  var result = new Array();
  var net = this.net;

  var imageIds = Array.apply(null, Array(imageUrls.length)).map(function (_, i) {
    return 'image' + (i + 1);
  });

  this.clarifai.tagURL(imageUrls, imageIds, function (err, res) {
    if (err) {
      if (typeof err["status_code"] === "string" && err["status_code"] === "TIMEOUT") {
        console.log("TAG request timed out");
      } else if (typeof err["status_code"] === "string" && err["status_code"] === "ALL_ERROR") {
        console.log("TAG request received ALL_ERROR. Contact Clarifai support if it continues.");
      } else if (typeof err["status_code"] === "string" && err["status_code"] === "TOKEN_FAILURE") {
        console.log("TAG request received TOKEN_FAILURE. Contact Clarifai support if it continues.");
      } else if (typeof err["status_code"] === "string" && err["status_code"] === "ERROR_THROTTLED") {
        console.log("Clarifai host is throttling this application.");
      } else {
        console.log("TAG request encountered an unexpected error: ");
        console.log(err);
      }
    } else {
      if (typeof res["status_code"] === "string" && (res["status_code"] === "OK")) {
        for (var i = 0; i < res.results.length; i++) {
          var inputVec = Array.apply(null, Array(inputLayerTags.length)).map(Number.prototype.valueOf, 0);
          var tags = res["results"][i].result["tag"]["classes"];
          var probs = res["results"][i].result["tag"]["probs"];

          for (var j = 0; j < tags.length; j++) {
            var index = inputLayerTags.indexOf(tags[j]);
            if (index > -1) {
              inputVec[index] = numMap(probs[j], 0.9, 1, 0, 100);
            }
          }

          result.push(net.predict(inputVec));
        }
      }
    }
    callback(result);
  });
}

function sceney(clarifaiKeys, readyCallback) {
  var that = this;

  this.clarifai = require('./clarifai_node');
  this.clarifai.initAPI(clarifaiKeys[0], clarifaiKeys[1]);
  this.clarifai.setThrottleHandler(function (bThrottled, waitSeconds) {
    console.log(bThrottled ? ["throttled. service available again in", waitSeconds, "seconds"].join(' ') : "not throttled");
  });

  fs.readFile("neurons.wt", "utf8", function (err, data) {
    if (err) {
      return console.log(err);
    }
    var saved_net = data;

    if (saved_net) {
      that.net = three_net.importNet(JSON.parse(saved_net));
    } else {
      console.log('Run train.js first');
    }

    readyCallback();
  });
}

module.exports = sceney;