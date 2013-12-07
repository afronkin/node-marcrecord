/**
 * Module dependencies.
 */
var marcrecord = require('../');
var MarcRecord = marcrecord.MarcRecord,
  MarcControlField = marcrecord.MarcControlField,
  MarcDataField = marcrecord.MarcDataField,
  MarcSubfield = marcrecord.MarcSubfield;

// Create new record.
process.stderr.write('Create new record: ');
var record = new MarcRecord();
if (record.size() === 0) {
  process.stderr.write('OK\n');
} else {
  process.stderr.write('FAILED\n');
}

// Create new control field.
process.stderr.write('Create new control field: ');
var controlField = new MarcControlField('001', 'ID/1');
if (controlField.tag === '001' && controlField.data === 'ID/1') {
  process.stderr.write('OK\n');
} else {
  process.stderr.write('FAILED\n');
}

// Add control field to the record.
process.stderr.write('Add control field to the record: ');
record.addVariableField(controlField);
if (record.size() === 1) {
  process.stderr.write('OK\n');
} else {
  process.stderr.write('FAILED\n');
}

// Create new data field.
process.stderr.write('Create new data field: ');
var dataField = new MarcDataField('900', '1', '2');
if (dataField.tag === '900' && dataField.ind1 == '1' && dataField.ind2 == '2'
    && dataField.size() === 0)
{
  process.stderr.write('OK\n');
} else {
  process.stderr.write('FAILED\n');
}

// Add data field to the record.
process.stderr.write('Add data field to the record: ');
record.addVariableField(dataField);
if (record.size() === 2) {
  process.stderr.write('OK\n');
} else {
  process.stderr.write('FAILED\n');
}

// Create new subfield.
process.stderr.write('Create new subfield: ');
var subfield = new MarcSubfield('a', 'Subfield data');
if (subfield.code === 'a' && subfield.data === 'Subfield data') {
  process.stderr.write('OK\n');
} else {
  process.stderr.write('FAILED\n');
}

// Add subfield to the data field.
process.stderr.write('Add subfield to the data field: ');
dataField.addSubfield(subfield);
if (dataField.size() === 1) {
  process.stderr.write('OK\n');
} else {
  process.stderr.write('FAILED\n');
}

// Create new embedded field.
process.stderr.write('Create new embedded field: ');
var embeddedField = new MarcControlField('001', 'ID/2');
var subfield = new MarcSubfield('1', embeddedField);
if (subfield.code === '1' && subfield.data instanceof MarcControlField) {
  process.stderr.write('OK\n');
} else {
  process.stderr.write('FAILED\n');
}

// Add embedded field to the data field.
process.stderr.write('Add embedded field to the data field: ');
dataField.addSubfield(subfield);
if (dataField.size() === 2) {
  process.stderr.write('OK\n');
} else {
  process.stderr.write('FAILED\n');
}

// Add another control field to the record and remove it right away.
process.stderr.write('Add another control field to the record: ');
var anotherControlField = new MarcControlField('009', 'Control field');
record.addVariableField(anotherControlField);
record.removeVariableField(anotherControlField);
if (record.size() === 2) {
  process.stderr.write('OK\n');
} else {
  process.stderr.write('FAILED\n');
}

// Print content of the record.
process.stderr.write('\nContent of the record:\n');
process.stdout.write(record.toString());
