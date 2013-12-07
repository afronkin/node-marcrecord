/**
 * Module dependencies.
 */
var fs = require('fs');

var marcrecord = require('../'),
    MarcRecord = marcrecord.MarcRecord,
    MarcIsoReader = marcrecord.MarcIsoReader;

// Read a MARC record from the file.
var record = new MarcRecord();
var marcReader = new MarcIsoReader();
marcReader.open('record_1.iso', 'cp1251', function(error) {
  if (error) {
    throw error;
  }
  marcReader.next(record, function(error) {
    if (error) {
      throw error;
    }

    // Print content of the record.
    process.stderr.write('Content of the record:\n');
    process.stdout.write(record.toString());
  });
});
