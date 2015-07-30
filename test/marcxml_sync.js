var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');

var marcWriter = new marcrecord.MarcXmlWriter();
marcWriter.openSync('record.xml', {encoding: 'utf-8'});
marcWriter.writeSync(data.records[0]);
marcWriter.closeSync();

console.error('OK');
