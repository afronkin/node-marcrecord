var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');

function writeRecord(fileName, callback) {
  var marcWriter = new marcrecord.MarcXmlWriter();
  marcWriter.open(fileName, {encoding: 'utf-8'}, function(err) {
    assert(!err);
    marcWriter.write(data.records[0], function(err) {
      assert(!err);
      marcWriter.close(callback);
    });
  });
}

writeRecord('record.xml', function(err) {
  assert(!err);
  console.error('OK');
});
