var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');

var isoFileName = 'records.iso';
var jsonFileName = 'records.json';
var xmlFileName = 'records.xml';
var encoding = 'utf-8';

function writeRecords(fileName, marcWriter) {
  marcWriter.openSync(fileName, {encoding: encoding});
  for (var i = 0; i < data.records.length; i++) {
    marcWriter.writeSync(data.records[i]);
  }
  marcWriter.closeSync();
}

function readRecords(fileName, marcReader) {
  marcReader.openSync(fileName, {encoding: encoding});
  for (var i = 0; record = marcReader.nextSync(); i++) {
    assert(record.equals(data.records[i]));
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
