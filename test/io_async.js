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

var records = [
  MarcRecord.parse('001 ID1\n005 20160101102030.1'),
  MarcRecord.parse('001 ID2\n333 45$eEEE$fFFF\n444 56$gGGG$hHHH'),
  MarcRecord.parse('001 ID3\n444 56$1001ID2$110023$xXXX$yYYY')
];

function writeRecord(marcWriter, recNo, callback) {
  marcWriter.write(records[recNo], function(err) {
    assert(!err);
    if (recNo + 1 === records.length) {
      return callback(null);
    }
    setImmediate(writeRecord, marcWriter, recNo + 1, callback);
  });
}

function writeRecords(fileName, marcWriter, callback) {
  assert(marcWriter.getPosition() === null);
  marcWriter.open(fileName, {encoding: 'utf-8'}, function(err) {
    assert(!err);
    writeRecord(marcWriter, 0, function (err) {
      assert(!err);
      assert(marcWriter.getPosition() > 0);
      marcWriter.close(function (err) {
        assert(!err);
        assert(marcWriter.getPosition() === null);
        callback(null);
      });
    });
  });
}

function readRecords(fileName, marcReader, callback) {
  var firstRecordSize = null;

  function readRecord(recNo, callback) {
    marcReader.next(function (err, record) {
      assert(!err && record.equals(records[recNo]));
      if (recNo + 1 === records.length) {
        return callback(null);
      }
      firstRecordSize = firstRecordSize || marcReader.getPosition();
      setImmediate(readRecord, recNo + 1, callback);
    });
  }

  function readRecordAt(recNo, position, size, callback) {
    marcReader.read(position, size, function (err, record) {
      assert(!err && record.equals(records[recNo]));
      return callback(null);
    });
  }

  marcReader.open(fileName, {encoding: 'utf-8'}, function(err) {
    assert(!err);
    readRecord(0, function (err) {
      assert(!err);
      readRecordAt(0, 0, firstRecordSize, function (err) {
        assert(!err);
        marcReader.close(function (err) {
          assert(!err);
          return callback(null);
        });
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

    var marcJsonWriter = new marcrecord.MarcJsonWriter();
    writeRecords(jsonFileName, marcJsonWriter, function (err) {
      assert(!err);
      var marcJsonReader = new marcrecord.MarcJsonReader();
      readRecords(jsonFileName, marcJsonReader, function (err) {
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
  });
});
