var fs = require('fs');

var eps = JSON.parse(fs.readFileSync('episodes.json'));
var desc = JSON.parse(fs.readFileSync('desc.json'));

for (var i = 0; i < eps.length; i++) {
  var season = eps[i].episodes;
  var seasonDescs = desc[i].episodes;
  for (var j = 0; j < season.length; j++) {
    //console.log(season[j].title.text + ': ' + seasonDescs[j].description.text);
    season[j].description = seasonDescs[j].description.text;
  };
};

fs.writeFileSync('new.json', JSON.stringify(eps));
