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
marcWriter.openSync('records.iso');
marcWriter.writeSync(record);
marcWriter.closeSync();
