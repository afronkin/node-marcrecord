var async = require('async');
var marcrecord = require('marcrecord');

var MarcRecord = marcrecord.MarcRecord;
var MarcControlField = marcrecord.MarcControlField;
var MarcDataField = marcrecord.MarcDataField;
var MarcSubfield = marcrecord.MarcSubfield;

var record = MarcRecord([
  MarcControlField('001', '00012345'),
  MarcControlField('005', '20110919104753.3'),
  MarcDataField('200', '1', ' ', [
    MarcSubfield('a', 'The Oxford Russian minidictionary'),
    MarcSubfield('f', 'ed. by Della Thompson')
  ])
]);

var marcWriter = new marcrecord.MarcIsoWriter();
marcWriter.open('records.iso', function(err) {
  if (err) {
    throw err;
  }

  marcWriter.write(record, function(err) {
    if (err) {
      throw err;
    }

    marcWriter.close(function(err) {
      if (err) {
        throw err;
      }
    });
  });
});
