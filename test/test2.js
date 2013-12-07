var fs = require('fs');

var marcrecord = require('../');
var MarcRecord = marcrecord.MarcRecord;

/*
 * Parse ISO2709 buffer of the record.
 */
function parseRecord(recordBuffer) {
  var record = new MarcRecord();
  record.parseIsoBuffer(recordBuffer);
  process.stdout.write('Leader: [' + record.leader + ']\n');
}

// Read a MARC record from the file.
var recordFileName = 'record_1.iso';
fs.exists(recordFileName, function(recordFileExists) {
  if (!recordFileExists) {
    throw new Error('file does not exists');
  }

  fs.stat(recordFileName, function(error, recordFileStats) {
    fs.open(recordFileName, "r", function(error, recordFile) {
      var recordBuffer = new Buffer(recordFileStats.size);
      fs.read(recordFile, recordBuffer, 0, recordBuffer.length, null,
        function(error, bytesRead, buffer) {
          parseRecord(recordBuffer);
          fs.close(recordFile);
        }
        );
    });
  });
});
