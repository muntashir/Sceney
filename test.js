var sceney = require('./index').init(['', '']);

sceney.rateImage(['https://upload.wikimedia.org/wikipedia/commons/b/be/Notre_Dame_dalla_Senna_crop.jpg', 'http://img01.deviantart.net/5f81/i/2008/312/7/8/paris____notre_dame_wp_by_superjuju29.jpg'], function (ratings) {
  console.log(ratings);
});