var three_net = require('3net.js');
var fs = require('fs');
var tags = [
  'travel',
  'tourism',
  'architecture',
  'no person',
  'waste',
  'garbage',
  'polution',
  'nature'
];

sceney.prototype.numMap = function (x, in_min, in_max, out_min, out_max) {
  return Math.min(in_min, (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}

sceney.prototype.rateImage = function (imageUrls, callback) {
  imageTags = {};

  this.callback = callback;
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
          var local_id = res.results[i].local_id;
          if (!imageTags.hasOwnProperty(local_id)) {
            imageTags[local_id] = {};
          }
          var currentImage = imageTags[local_id];
          var tags = res["results"][i].result["tag"]["classes"];
          var probs = res["results"][i].result["tag"]["probs"];

          for (var j = 0; j < tags.length; j++) {
            currentImage[tags[j]] = probs[j];
          }
        }
      }
      console.log(imageTags);
    }
  });

}

sceney.prototype.trainImage = function (imageUrls, labels, callback) {
  callback(0);
}

function sceney(clarifaiKeys) {
  this.clarifai = require('./clarifai_node');
  this.clarifai.initAPI(clarifaiKeys[0], clarifaiKeys[1]);
  this.clarifai.setThrottleHandler(function (bThrottled, waitSeconds) {
    console.log(bThrottled ? ["throttled. service available again in", waitSeconds, "seconds"].join(' ') : "not throttled");
  });

  var inputLayer = 10;
  var hiddenLayer = 25;
  var outputLayer = 1;
  var neuron = 'sigmoid';

  var saved_net;
  //TODO Load net from file

  if (saved_net) {
    this.net = three_net.importNet(JSON.parse(saved_net));
  } else {
    console.log('Run train.js first');
  }
}

module.exports = sceney;