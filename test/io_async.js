var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');
var isoFileName = 'records.iso';
var xmlFileName = 'records.xml';

function writeRecord(marcWriter, recNo, callback) {
  marcWriter.write(data.records[recNo], function(err) {
    assert(!err);
    if (recNo + 1 === data.records.length) {
      return callback(null);
    }
    setImmediate(writeRecord, marcWriter, recNo + 1, callback);
  });
}

function writeRecords(fileName, marcWriter, callback) {
  marcWriter.open(fileName, {encoding: 'utf-8'}, function(err) {
    assert(!err);
    writeRecord(marcWriter, 0, function (err) {
      assert(!err);
      marcWriter.close(function (err) {
        assert(!err);
        callback(null);
      });
    });
  });
}

function readRecord(marcReader, recNo, callback) {
  marcReader.next(function (err, record) {
    assert(!err && record.equals(data.records[recNo]));
    if (recNo + 1 === data.records.length) {
      return callback(null);
    }
    setImmediate(readRecord, marcReader, recNo + 1, callback);
  });
}

function readRecords(fileName, marcReader, callback) {
  marcReader.open(fileName, {encoding: 'utf-8'}, function(err) {
    assert(!err);
    readRecord(marcReader, 0, function (err) {
      assert(!err);
      marcReader.close(function (err) {
        assert(!err);
        return callback(null);
      });
    });
  });
}

var marcIsoWriter = new marcrecord.MarcIsoWriter();
writeRecords(isoFileName, marcIsoWriter, function (err) {
  assert(!err);
  var marcIsoReader = new marcrecord.MarcIsoReader();
  readRecords(isoFileName, marcIsoReader, function (err) {
    assert(!err);

    var marcXmlWriter = new marcrecord.MarcXmlWriter();
    writeRecords(xmlFileName, marcXmlWriter, function (err) {
      assert(!err);

      var marcXmlReader = new marcrecord.MarcXmlReader();
      readRecords(xmlFileName, marcXmlReader, function (err) {
        assert(!err);
        console.error('OK');
      });
    });
  });
});
