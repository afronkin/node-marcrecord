try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');

var MarcRecord = marcrecord.MarcRecord;
var MarcIsoReader = marcrecord.MarcIsoReader;
var MarcIsoWriter = marcrecord.MarcIsoWriter;

var marcWriter = new MarcIsoWriter();
marcWriter.openSync('records_2.iso', {encoding: 'cp1251'});
for (var i = 0; i < data.records.length; i++) {
  marcWriter.writeSync(data.records[i]);
}
marcWriter.closeSync();

var marcReader = new MarcIsoReader();
marcReader.openSync('records_2.iso', {encoding: 'cp1251'});
while (record = marcReader.nextSync()) {
  console.log(record.getControlNumber());
}
marcReader.closeSync();
