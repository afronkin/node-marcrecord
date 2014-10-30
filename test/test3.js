var fs = require('fs');

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

console.log('Fields after reordering:');
record.sort();
var fields = record.getVariableFields();
for (var i = 0; i < fields.length; i++) {
  console.log(fields[i].tag);
}

console.log('\nSubfields after reordering:');
var field = record.getVariableField('950');
field.sort();
var subfields = field.getSubfields();
for (var i = 0; i < subfields.length; i++) {
  var subfield = subfields[i];
  if (subfield.isEmbeddedField()) {
    console.log("%s <%s>", subfield.code, subfield.data.tag);
  } else {
    console.log(subfield.code);
  }
}
