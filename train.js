var three_net = require('3net.js');
var fs = require('fs');
var clarifai = require('./clarifai_node');

var clarifaiKeys = [
  '',
  ''
];

var inputLayerTags = [
  'travel',
  'tourism',
  'architecture',
  'no person',
  'waste',
  'garbage',
  'polution',
  'nature',
  '9',
  '10'
];

var imageUrls = [
  'https://upload.wikimedia.org/wikipedia/commons/b/be/Notre_Dame_dalla_Senna_crop.jpg',
  'http://img01.deviantart.net/5f81/i/2008/312/7/8/paris____notre_dame_wp_by_superjuju29.jpg'
];

var labels = [
  [1],
  [1]
];

var inputLayer = 10;
var hiddenLayer = 25;
var outputLayer = 1;
var neuron = 'sigmoid';

var options = {
  "iters": 100,
  "learning_rate": 0.5,
  "regularization": 0,
  "dropconnect": 0,
  "change_cost": 0.00001
};

var net = three_net.createNet(inputLayer, hiddenLayer, outputLayer, neuron);

clarifai.initAPI(clarifaiKeys[0], clarifaiKeys[1]);
clarifai.setThrottleHandler(function (bThrottled, waitSeconds) {
  console.log(bThrottled ? ["throttled. service available again in", waitSeconds, "seconds"].join(' ') : "not throttled");
});

var imageIds = Array.apply(null, Array(inputLayerTags.length)).map(function (_, i) {
  return 'image' + (i + 1);
});

clarifai.tagURL(imageUrls, imageIds, function (err, res) {
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
      var dataset = new Array();

      for (var i = 0; i < res.results.length; i++) {
        var inputVec = Array.apply(null, Array(inputLayer)).map(Number.prototype.valueOf, 0);
        var tags = res["results"][i].result["tag"]["classes"];
        var probs = res["results"][i].result["tag"]["probs"];

        for (var j = 0; j < tags.length; j++) {
          var index = inputLayerTags.indexOf(tags[j]);
          if (index > -1) {
            inputVec[index] = numMap(probs[j], 0.9, 1, 0, 100);
          }
        }

        dataset.push(inputVec);
      }
      var success = net.trainSet(dataset, labels, options);

      if (success) console.log("training complete");
    }
  }
});

function numMap(x, in_min, in_max, out_min, out_max) {
  return Math.max(in_min, (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}