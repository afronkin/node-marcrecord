try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');
var record = data.records[0];

console.log('Fields after reordering:');
record.sort();
var fields = record.getVariableFields();
for (var i = 0; i < fields.length; i++) {
  console.log(fields[i].toString());
}

console.log('\nSubfields after reordering:');
var field = record.getVariableField('950');
field.sort();
var subfields = field.getSubfields();
for (var i = 0; i < subfields.length; i++) {
  console.log(subfields[i].toString());
}
