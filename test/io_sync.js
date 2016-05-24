var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var MarcRecord = marcrecord.MarcRecord;

var isoFileName = 'records.iso';
var jsonFileName = 'records.json';
var xmlFileName = 'records.xml';
var encoding = 'utf-8';

var records = [
  MarcRecord.parse('001 ID1\n005 20160101102030.1'),
  MarcRecord.parse('001 ID2\n333 45$eEEE$fFFF\n444 56$gGGG$hHHH'),
  MarcRecord.parse('001 ID3\n444 56$1001ID2$110023$xXXX$yYYY')
];

function writeRecords(fileName, marcWriter) {
  marcWriter.openSync(fileName, {encoding: encoding});
  for (var i = 0; i < records.length; i++) {
    marcWriter.writeSync(records[i]);
  }
  marcWriter.closeSync();
}

function readRecords(fileName, marcReader) {
  marcReader.openSync(fileName, {encoding: encoding});
  for (var i = 0; record = marcReader.nextSync(); i++) {
    assert(record.equals(records[i]));
  }
  marcReader.closeSync();
}

var marcIsoWriter = new marcrecord.MarcIsoWriter();
writeRecords(isoFileName, marcIsoWriter);

var marcIsoReader = new marcrecord.MarcIsoReader();
readRecords(isoFileName, marcIsoReader);

var marcJsonWriter = new marcrecord.MarcJsonWriter();
writeRecords(jsonFileName, marcJsonWriter);

var marcJsonReader = new marcrecord.MarcJsonReader();
readRecords(jsonFileName, marcJsonReader);

var marcXmlWriter = new marcrecord.MarcXmlWriter();
writeRecords(xmlFileName, marcXmlWriter);

var marcXmlReader = new marcrecord.MarcXmlReader();
readRecords(xmlFileName, marcXmlReader);

console.error('OK');
