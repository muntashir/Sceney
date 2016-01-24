# Sceney

[![NPM](https://nodei.co/npm/3net.js.png)](https://npmjs.org/package/3net.js)

Created for ConU Hacks 2016. Used in https://github.com/Jefftree/scenify

Rates how scenic an image is. See test.js for an example on how to use it. Requires a Clarifai API key. Modify and run train.js to train the network.

Uses Clarifai to generate tags for the image, then uses 3net.js on the tags to rate images.

#### Initialization
    var Sceney = require('sceney')
  
    var imageUrls = [
      'https://upload.wikimedia.org/wikipedia/commons/b/be/Notre_Dame_dalla_Senna_crop.jpg',
      'http://img01.deviantart.net/5f81/i/2008/312/7/8/paris____notre_dame_wp_by_superjuju29.jpg'
    ];
     
    var sceney = Sceney.init([process.env.CLARIFAI_CLIENT_ID, process.env.CLARIFAI_CLIENT_SECRET], function () {
    
      sceney.rateImage(imageUrls, function (ratings) {
        console.log(ratings); // ratings is an array of numbers from 0 to 1 with the ratings of how scenic each picture is
      });
      
    });
