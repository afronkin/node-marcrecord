var async = require('async');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var MarcRecord = marcrecord.MarcRecord;
var MarcIsoReader = marcrecord.MarcIsoReader;
var MarcIsoWriter = marcrecord.MarcIsoWriter;

function writeRecords(fileName, callback) {
  var data = require('./data');

  var marcWriter = new MarcIsoWriter();
  marcWriter.open(fileName, {encoding: 'cp1251'}, function(err) {
    if (err) {
      return callback(err);
    }

    async.eachSeries(data.records,
      function(record, next) {
        marcWriter.write(record, next);
      },
      function(err) {
        if (err) {
          return callback(err);
        }

        marcWriter.close(function(err) {
          if (err) {
            return callback(err);
          }
          callback();
        });
      }
    );
  });
}

function readRecords(fileName, callback) {
  var marcReader = new MarcIsoReader();
  marcReader.open(fileName, {encoding: 'cp1251'}, function(err) {
    if (err) {
      return callback(err);
    }

    async.forever(
      function(next) {
        marcReader.next(function(err, record) {
          if (err || !record) {
            return next(err || 'EOF');
          }

          console.log(record.toString());
          next();
        });
      },
      function(err) {
        if (err && err !== 'EOF') {
          return callback(err);
        }

        marcReader.close(function(err) {
          if (err) {
            return callback(err);
          }
          callback();
        });
      }
    );
  });
}

writeRecords('records_2.iso', function(err) {
  if (err) {
    throw err;
  }

  readRecords('records_2.iso', function(err) {
    if (err) {
      throw err;
    }

    console.error('Done.');
  });
});
