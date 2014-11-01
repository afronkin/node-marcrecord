var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');

function writeRecord(fileName, callback) {
  var marcWriter = new marcrecord.MarcIsoWriter();
  marcWriter.open(fileName, {encoding: 'utf-8'}, function(err) {
    assert(!err);
    marcWriter.write(data.records[0], function(err) {
      assert(!err);
      marcWriter.close(callback);
    });
  });
}

function readRecord(fileName, callback) {
  var marcReader = new marcrecord.MarcIsoReader();
  marcReader.open(fileName, {encoding: 'utf-8'}, function(err) {
    assert(!err);
    marcReader.next(function(err, record) {
      assert(!err);
      marcReader.close(function(err) {
        assert(!err);
        assert(record.equals(data.records[0]));
        callback();
      });
    });
  });
}

writeRecord('record.iso', function(err) {
  assert(!err);
  readRecord('record.iso', function(err) {
    assert(!err);
    console.error('OK');
  });
});
