var async = require('async');
var marcrecord = require('marcrecord');

var MarcRecord = marcrecord.MarcRecord;
var MarcIsoReader = marcrecord.MarcIsoReader;

// Open MARC file.
var marcReader = new MarcIsoReader();
marcReader.open('records_1.iso', 'cp1251', function(err) {
  if (err) {
    throw err;
  }

  // Read MARC records from the file.
  async.forever(
    function(next) {
      marcReader.next(function(err, record) {
        if (err || !record) {
          return callback(err || 'EOF');
        }

        console.log(record.toString());
        next();
      });
    },
    function(err) {
      marcReader.close();
      if (err && err !== 'EOF') {
        console.error(err.message);
      }
    }
  );
});
