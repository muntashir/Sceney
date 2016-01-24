var Sceney = require('./index')

var imageUrls = [
  'https://images.thetrumpet.com/51e9636a!h.300,id.9292,m.fill,w.540',
  'https://c1.staticflickr.com/1/572/22607522004_1380a87e79_b.jpg'
];

var sceney = Sceney.init([process.env.CLARIFAI_CLIENT_ID, process.env.CLARIFAI_CLIENT_SECRET], function () {
  sceney.rateImage(imageUrls, function (ratings) {
    console.log(ratings);
  });
});