var fs = require('fs');

var marcrecord = require('../'),
    MarcRecord = marcrecord.MarcRecord,
    MarcIsoReader = marcrecord.MarcIsoReader;

/*
 * Reads a MARC records from the file.
 */
function readNextRecord() {
  marcReader.next(function(err, record) {
    if (err) {
      throw err;
    }

    // End of the file reached.
    if (record === null) {
      return;
    }

    // Print the content of the record.
    process.stdout.write('Content of the record:\n');
    process.stdout.write(record.toString());

    // Read the next record after all I/O will be performed.
    setTimeout(readNextRecord(), 0);
  });
}

// Read a MARC record from the file.
var marcReader = new MarcIsoReader();
marcReader.open('records_2.iso', 'cp1251', function(err) {
  if (err) {
    throw err;
  }
  readNextRecord();
});
