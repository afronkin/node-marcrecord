try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var MarcRecord = marcrecord.MarcRecord;
var MarcIsoReader = marcrecord.MarcIsoReader;
var MarcIsoWriter = marcrecord.MarcIsoWriter;

var marcReader = new MarcIsoReader();
marcReader.openSync('records_2.iso', 'cp1251');

var marcWriter = new MarcIsoWriter();
marcWriter.openSync('records_3.iso', 'cp1251');

while (record = marcReader.nextSync()) {
  marcWriter.writeSync(record);
}

marcReader.closeSync();
marcWriter.closeSync();
