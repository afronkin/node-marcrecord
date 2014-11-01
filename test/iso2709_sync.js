var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');

var marcWriter = new marcrecord.MarcIsoWriter();
marcWriter.openSync('record.iso', {encoding: 'utf-8'});
marcWriter.writeSync(data.records[0]);
marcWriter.closeSync();

var marcReader = new marcrecord.MarcIsoReader();
marcReader.openSync('record.iso', {encoding: 'utf-8'});
var record = marcReader.nextSync();
marcReader.closeSync();

assert(record.equals(data.records[0]));

console.error('OK');
