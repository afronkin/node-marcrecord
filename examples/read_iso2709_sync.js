var marcrecord = require('marcrecord');

var marcReader = new marcrecord.MarcIsoReader();
marcReader.openSync('records.iso');

while (record = marcReader.nextSync()) {
  console.log(record.toString());
}

marcReader.closeSync();
