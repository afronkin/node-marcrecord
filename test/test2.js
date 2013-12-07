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
marcReader.open('record_1.iso', 'utf-8', function(error) {
  if (error) {
    throw error;
  }
  marcReader.next(record, function(error) {
    if (error) {
      throw error;
    }
    process.stdout.write('Leader: [' + record.leader + ']\n');
  });
});
