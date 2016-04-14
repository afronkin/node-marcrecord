var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');
var isoFileName = 'records.iso';
var xmlFileName = 'records.xml';

function isoWrite() {
  var marcWriter = new marcrecord.MarcIsoWriter();
  marcWriter.openSync(isoFileName, {encoding: 'utf-8'});
  for (var i = 0; i < data.records.length; i++) {
    marcWriter.writeSync(data.records[i]);
  }
  marcWriter.closeSync();
}

function isoRead() {
  var marcReader = new marcrecord.MarcIsoReader();
  marcReader.openSync(isoFileName, {encoding: 'utf-8'});
  for (var i = 0; record = marcReader.nextSync(); i++) {
    assert(record.equals(data.records[i]));
  }
  marcReader.closeSync();
}

function xmlWrite() {
  var marcWriter = new marcrecord.MarcXmlWriter();
  marcWriter.openSync(xmlFileName, {encoding: 'utf-8'});
  for (var i = 0; i < data.records.length; i++) {
    marcWriter.writeSync(data.records[i]);
  }
  marcWriter.closeSync();
}

function xmlRead() {
  var marcReader = new marcrecord.MarcXmlReader();
  marcReader.openSync(xmlFileName, {encoding: 'utf-8'});
  for (var i = 0; record = marcReader.nextSync(); i++) {
    assert(record.equals(data.records[i]));
  }
  marcReader.closeSync();
}

isoWrite();
isoRead();
xmlWrite();
xmlRead();

console.error('OK');
