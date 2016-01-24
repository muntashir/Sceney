var BATCH_SIZE = 5;
var currentIndex = 0;

var three_net = require('3net.js');
var fs = require('fs');
var clarifai = require('./clarifai_node');

var clarifaiKeys = [process.env.CLARIFAI_CLIENT_ID, process.env.CLARIFAI_CLIENT_SECRET];

var inputLayerTags = [
  'travel',
  'tourism',
  'architecture',
  'no person',
  'waste',
  'garbage',
  'polution',
  'nature',
  'calamity',
  'street'
];

var imageUrls = [
  'http://wanderingtrader.com/wp-content/uploads/2010/12/Old-Montreal.jpg',
  'https://rawkandrolljunkie.files.wordpress.com/2015/02/montreal-street-scene-john-rizzuto.jpg',
  'http://www.tourisme-montreal.org/blog/wp-content/uploads/2014/06/St-Paul-Street-Old-Port.jpg',
  'http://revelblog.com/wp-content/uploads/2011/06/IMG_8299.jpg',
  'http://i.dailymail.co.uk/i/pix/2011/03/23/article-1368955-0B4E817900000578-215_468x286.jpg',
  'http://media1.trover.com/T/5484ca3dd6bdd425ea0095a5/fixedw_large_2x.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/f/fd/Gratiot_Avenue_Detroit.jpg',
  'http://cdn1.pri.org/sites/default/files/styles/original_image/public/story/images/Detroit_WEB.jpg?itok=9bFFuSHq',
  'http://montrealvisitorsguide.com/wp-content/uploads/montreal-downtown.jpg',
  'http://www.shanemcdonald.me/wp-content/uploads/2012/10/IMG_9486-4-5-655x343.jpeg',
  'http://static.panoramio.com/photos/original/43037526.jpg',
  'http://benross.net/images/blog%20images/10-09_canada/5_montreal/03.JPG',
  'http://c2.staticflickr.com/6/5242/5325675714_55bb1f2b29_n.jpg',
  'https://rawsilkandsaffron.files.wordpress.com/2010/11/img_0367-793809.jpg',
  'http://farm4.static.flickr.com/3537/3374001848_2c21e23a60_o.jpg',
  'http://cdn.cstatic.net/images/gridfs/53a1dfcaf92ea12237003ad1/42.jpg',
  'http://static2.businessinsider.com/image/51eea12269beddb25f000018/this-is-for-everyone-whos-thinking-of-buying-one-of-those-500-homes-in-detroit.jpg',
  'http://theeconomiccollapseblog.com/wp-content/uploads/2013/07/Detroit-Photo-by-Bob-Jagendorf.jpg',
  'http://media1.fdncms.com/metrotimes/imager/the-intersection-of-springwells-street-and/u/zoom/2277539/feature1-1.jpg',
  'http://transit.toronto.on.ca/photos/images/ttc-7772.jpg',
  'http://oneilladvisors.ca/wp-content/uploads/2011/02/photo_kingstonrd.jpg',
  'http://farm4.static.flickr.com/3507/3695274803_cec2fc09fb.jpg?v=0',
  'http://danfortheastonline.ca/wp-content/uploads/2015/04/danforth-street.png',
  'http://www.boldts.net/p2/TorMs.2.jpeg',
  'http://img1ca.trovit.ca/1tte5z1m1s1z/1tte5z1m1s1z.1_6.jpg',
  'http://d236bkdxj385sg.cloudfront.net/wp-content/uploads/2014/10/detroit-street-scene.jpg',
  'http://pegsontheline.com/wp-content/uploads/2012/05/DSC024831.jpg',
  'http://www.urbanphoto.net/blog/wp-content/uploads/2007/07/grey3.jpg'
];

var labels = [
  [1],
  [1],
  [1],
  [1],
  [0],
  [0],
  [0],
  [0],
  [1],
  [1],
  [1],
  [1],
  [1],
  [1],
  [0],
  [0],
  [0],
  [0],
  [0],
  [0],
  [0],
  [0],
  [0],
  [0],
  [0],
  [0],
  [1],
  [1]
];

var inputLayer = inputLayerTags.length;
var hiddenLayer = 50;
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

makeBatch();

function makeBatch() {
  if (currentIndex >= imageUrls.length) {
    console.log('DONE TRAINING');
    return;
  }

  var batchUrls = new Array();
  var batchLabels = new Array();

  for (var i = currentIndex; i < currentIndex + BATCH_SIZE; i++) {
    if (!!imageUrls[i]) {
      batchUrls.push(imageUrls[i]);
      batchLabels.push(labels[i]);
    } else {
      currentIndex = i;
      if (batchUrls.length > 0) {
        trainBatch(batchUrls, batchLabels, makeBatch);
        return;
      } else {
        console.log('DONE TRAINING');
        return;
      }
    }
  }
  currentIndex = i;
  trainBatch(batchUrls, batchLabels, makeBatch);
}

function trainBatch(batchUrls, batchLabels, callback) {
  var imageIds = Array.apply(null, Array(batchUrls.length)).map(function (_, i) {
    return 'image' + (i + 1);
  });

  clarifai.tagURL(batchUrls, imageIds, function (err, res) {
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
        
        var success = net.trainSet(dataset, batchLabels, options);

        if (success) {
          console.log("batch training complete");
          fs.writeFile("neurons.wt", JSON.stringify(net.exportNet()), function (err) {
            if (err) {
              return console.log(err);
            }
            console.log("net parameters saved");
            callback();
          });;
        }
      }
    }
  });
}

function numMap(x, in_min, in_max, out_min, out_max) {
  return Math.max(in_min, (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min);
}