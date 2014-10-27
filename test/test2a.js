var async = require('async');
var marcrecord = require('marcrecord');

var MarcRecord = marcrecord.MarcRecord;
var MarcIsoReader = marcrecord.MarcIsoReader;
var MarcIsoWriter = marcrecord.MarcIsoWriter;

// Open MARC file.
var marcReader = new MarcIsoReader();
marcReader.open('records_2.iso', 'cp1251', function(err) {
  if (err) {
    throw err;
  }

  var marcWriter = new MarcIsoWriter();
  marcWriter.open('records_3.iso', 'cp1251', function(err) {
    if (err) {
      throw err;
    }

    // Read MARC records from the file.
    async.forever(
      function(next) {
        marcReader.next(function(err, record) {
          if (err || !record) {
            return next(err || 'EOF');
          }

          marcWriter.write(record, next);
        });
      },
      function(err) {
        marcReader.close(function() {
          marcWriter.close(function() {
            if (err && err !== 'EOF') {
              console.error(err.message);
            }
          });
        });
      }
    );
  });
});
