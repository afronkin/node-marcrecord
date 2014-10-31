var async = require('async');
var marcrecord = require('marcrecord');

var marcReader = new marcrecord.MarcIsoReader();
marcReader.open('records.iso', function(err) {
  if (err) {
    throw err;
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
        throw err;
      }

      marcReader.close(function(err) {
        if (err) {
          throw err;
        }
      });
    }
  );
});
