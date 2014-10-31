try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');
var record = data.records[0];

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
  var embeddedField = field.getVariableField('905');
  if (embeddedField) {
    console.log(embeddedField.toString());
  }
}
