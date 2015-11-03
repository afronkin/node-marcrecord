var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');

var MarcRecord = marcrecord.MarcRecord;
var MarcVariableField = marcrecord.MarcVariableField;
var MarcControlField = marcrecord.MarcControlField;
var MarcDataField = marcrecord.MarcDataField;
var MarcSubfield = marcrecord.MarcSubfield;

/*
 * MarcRecord.equals()
 */
assert(data.records[0].equals(data.records[0]));
assert(data.records[0].equals(data.records[0], true));
assert(!data.records[0].equals(data.records[1]));
assert(!data.records[0].equals(data.records[1], true));
assert(!data.records[1].equals(data.records[2]));

assert(MarcRecord.equals(data.records[0], data.records[0]));
assert(MarcRecord.equals(data.records[0], data.records[0], true));
assert(!MarcRecord.equals(data.records[0], data.records[1]));
assert(!MarcRecord.equals(data.records[0], data.records[1], true));
assert(!MarcRecord.equals(data.records[1], data.records[2]));
assert(MarcRecord.equals(data.records[1], data.records[2], true));

assert(MarcRecord.equals(data.records[0].getVariableFields(),
  data.records[0]));
assert(!MarcRecord.equals(data.records[0],
  data.records[0].getDataFields()));
assert(MarcRecord.equals(data.records[0].getVariableFields('900'),
  data.records[0].getVariableFields('900')));
assert(MarcRecord.equals(data.records[1].getVariableFields(),
  data.records[2].getVariableFields(), true));

/*
 * MarcVariableField.equals()
 */
assert(data.records[0].getVariableField('001').equals(
  data.records[0].getVariableField('001')));
assert(!data.records[0].getVariableField('001').equals(
  data.records[1].getVariableField('001')));
assert(!data.records[1].getVariableField('100').equals(
  data.records[2].getVariableField('100')));
assert(data.records[1].getVariableField('100').equals(
  data.records[2].getVariableField('100'), true));

assert(MarcVariableField.equals(data.records[0].getVariableField('001'),
  data.records[0].getVariableField('001')));
assert(!MarcVariableField.equals(data.records[0].getVariableField('001'),
  data.records[1].getVariableField('001')));
assert(!MarcVariableField.equals(data.records[1].getVariableField('100'),
  data.records[2].getVariableField('100')));
assert(MarcVariableField.equals(data.records[1].getVariableField('100'),
  data.records[2].getVariableField('100'), true));

var subfields1 = data.records[1].getVariableField('100').getSubfields();
var subfields2 = data.records[2].getVariableField('100').getSubfields();
assert(!MarcVariableField.equals(subfields1, subfields2));
assert(MarcVariableField.equals(subfields1, subfields2, true));

/*
 * MarcControlField.equals()
 */
assert(data.records[0].getControlNumberField().equals(
  data.records[0].getControlNumberField()));
assert(!data.records[0].getControlNumberField().equals(
  data.records[1].getControlNumberField()));

assert(MarcControlField.equals(data.records[0].getControlNumberField(),
  data.records[0].getControlNumberField()));
assert(!MarcControlField.equals(data.records[0].getControlNumberField(),
  data.records[1].getControlNumberField()));

/*
 * MarcDataField.equals()
 */
assert(!MarcDataField.equals(data.records[1].getVariableField('100'),
  data.records[2].getVariableField('100')));
assert(MarcDataField.equals(data.records[1].getVariableField('100'),
  data.records[2].getVariableField('100'), true));

var subfields1 = data.records[1].getVariableField('100').getSubfields();
var subfields2 = data.records[2].getVariableField('100').getSubfields();
assert(!MarcDataField.equals(subfields1, subfields2));
assert(MarcDataField.equals(subfields1, subfields2, true));

/*
 * MarcSubfield.equals()
 */
assert(data.records[1].getSubfield('100', 'a').equals(
  data.records[1].getSubfield('100', 'a')));
assert(!data.records[1].getSubfield('100', 'a').equals(
  data.records[1].getSubfield('100', 'b')));
assert(data.records[0].getSubfield('950', '1').equals(
  data.records[0].getSubfield('950', '1')));

assert(MarcSubfield.equals(data.records[1].getSubfield('100', 'a'),
  data.records[1].getSubfield('100', 'a')));
assert(!MarcSubfield.equals(data.records[1].getSubfield('100', 'a'),
  data.records[1].getSubfield('100', 'b')));
assert(MarcSubfield.equals(data.records[0].getSubfield('950', '1'),
  data.records[0].getSubfield('950', '1')));

console.error('OK');
