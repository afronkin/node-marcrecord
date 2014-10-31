try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var MarcRecord = marcrecord.MarcRecord;
var MarcControlField = marcrecord.MarcControlField;
var MarcDataField = marcrecord.MarcDataField;
var MarcSubfield = marcrecord.MarcSubfield;

var record = new MarcRecord([
  new MarcControlField('001', '1'),
  new MarcDataField('950', '3', '4', [
    new MarcSubfield('1', new MarcDataField('905', '5', '6', [
      new MarcSubfield('z', 'Z'),
      new MarcSubfield('a', 'A')
    ])),
    new MarcSubfield('c', 'C'),
    new MarcSubfield('1', new MarcControlField('001', '2')),
    new MarcSubfield('b', 'B')
  ]),
  new MarcDataField('900', '1', '2', [
    new MarcSubfield('c', 'C'),
    new MarcSubfield('a', 'A'),
    new MarcSubfield('b', 'B')
  ]),
]);

console.log('Embedded fields:');
var field = record.getVariableField('950');
if (field) {
  var embeddedFields = field.getVariableFields(['001', '905']);
  for (var i = 0; i < embeddedFields.length; i++) {
    console.log(embeddedFields[i].toString());
  }
}

console.log('\nFirst embedded field:');
var field = record.getVariableField('950');
if (field) {
  var embeddedField = field.getVariableFields('905');
  if (embeddedField) {
    console.log(embeddedField.toString());
  }
}
