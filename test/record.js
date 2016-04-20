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
 * MarcRecord constructor.
 */
var record = new MarcRecord();
assert(record.leader.length === 24 && record.fields.length === 0);

var record = new MarcRecord(data.records[0]);
assert(record.fields.length === 4);

var fields = [
  new MarcControlField('001', 'ID1'),
  new MarcControlField('005', '20160101102030.1')
];
var record = new MarcRecord(fields);
assert(record.fields.length === 2);

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
 * MarcRecord.size()
 */
assert(data.records[0].size() === 4);
assert(data.records[1].size() === 2);
assert(data.records[2].size() === 2);

/*
 * MarcRecord.clear()
 */
var record = new MarcRecord(data.records[0]);
record.clear();
assert(record.fields.length === 0);

/*
 * MarcRecord.addVariableField()
 */
var record = new MarcRecord();
record.addVariableField(new MarcControlField('001', 'ID1'));
record.addVariableField(
  new MarcDataField('200', [new MarcSubfield('a', 'Title')]));
assert(record.fields.length === 2);

/*
 * MarcRecord.removeVariableField()
 */
var record = new MarcRecord(data.records[0]);
record.removeVariableField(record.fields[0]);
assert(record.fields.length === 3);
record.removeVariableField(record.fields[1]);
assert(record.fields.length === 2);

/*
 * MarcRecord.getVariableFields()
 */
assert(data.records[0].getVariableFields().length === 4);
assert(data.records[0].getVariableFields('001').length === 1);
assert(data.records[0].getVariableFields('900').length === 2);
assert(data.records[0].getVariableFields('555').length === 0);
assert(data.records[0].getVariableFields(/^9..$/).length === 3);
assert(data.records[0].getVariableFields(/^5..$/).length === 0);
assert(data.records[0].getVariableFields(['950', '001']).length === 2);
assert(data.records[0].getVariableFields([/^9/, '001', /^0/]).length === 4);
assert(data.records[0].getVariableFields(['007', /^5/]).length === 0);

/*
 * MarcRecord.getVariableField()
 */
assert(data.records[0].getVariableField().tag === '001');
assert(data.records[0].getVariableField('001').tag === '001');
assert(data.records[0].getVariableField('900').tag === '900');
assert(data.records[0].getVariableField('555') === null);
assert(data.records[0].getVariableField(/^9..$/).tag === '950');
assert(data.records[0].getVariableField(/^5..$/) === null);
assert(data.records[0].getVariableField(['950', '001']).tag === '001');
assert(data.records[0].getVariableField([/^9/, '001', /^0/]).tag === '001');
assert(data.records[0].getVariableField(['007', /^5/]) === null);

/*
 * MarcRecord.getControlFields()
 */
assert(data.records[0].getControlFields().length === 1);
assert(data.records[0].getControlFields('001').length === 1);
assert(data.records[0].getControlFields('005').length === 0);
assert(data.records[0].getControlFields('900').length === 0);
assert(data.records[0].getControlFields(/^0../).length === 1);
assert(data.records[0].getControlFields(/^005/).length === 0);
assert(data.records[0].getControlFields(['005', '001']).length === 1);
assert(data.records[0].getControlFields([/^005/, '001', /^0/]).length === 1);
assert(data.records[0].getControlFields(['007', /^005/]).length === 0);

/*
 * MarcRecord.getDataFields()
 */
assert(data.records[0].getDataFields().length === 3);
assert(data.records[0].getDataFields('900').length === 2);
assert(data.records[0].getDataFields('555').length === 0);
assert(data.records[0].getDataFields('001').length === 0);
assert(data.records[0].getDataFields(/^9..$/).length === 3);
assert(data.records[0].getDataFields(/^5..$/).length === 0);
assert(data.records[0].getDataFields(['950', '001']).length === 1);
assert(data.records[0].getDataFields([/^9/, '001', /^0/]).length === 3);
assert(data.records[0].getDataFields(['007', /^5/]).length === 0);

assert(data.records[0].getDataFields('950', '3').length === 1);
assert(data.records[0].getDataFields('950', '3', '4').length === 1);
assert(data.records[0].getDataFields('950', '1', '1').length === 0);
assert(data.records[0].getDataFields(/^9../, '1', '2').length === 1);

/*
 * MarcRecord.getControlFieldData()
 */
assert(data.records[0].getControlFieldData() === 'ID/1');
assert(data.records[0].getControlFieldData('001') === 'ID/1');
assert(data.records[0].getControlFieldData('005') === null);
assert(data.records[0].getControlFieldData('900') === null);
assert(data.records[0].getControlFieldData(/^0../) === 'ID/1');
assert(data.records[0].getControlFieldData(/^005/) === null);
assert(data.records[0].getControlFieldData(['005', '001']) === 'ID/1');
assert(data.records[0].getControlFieldData([/^005/, '001', /^0/]) === 'ID/1');
assert(data.records[0].getControlFieldData(['007', /^005/]) === null);

/*
 * MarcRecord.getControlNumber()
 */
assert(data.records[0].getControlNumber() === 'ID/1');
assert(data.records[1].getControlNumber() === 'ID/2');
assert((new MarcRecord()).getControlNumber() === null);

/*
 * MarcRecord.getSubfield()
 */
assert(data.records[0].getSubfield('900', 'a').data === 'A');
assert(data.records[0].getSubfield('555', 'a') === null);
assert(data.records[0].getSubfield(/^9../, 'b').data === 'B');
assert(data.records[0].getSubfield(/^9../, 'a') === null);
assert(data.records[0].getSubfield(['555', /^9../], 'c').data === 'C');
assert(data.records[0].getSubfield('950', ['a', 'b', 'c']).data === 'C');
assert(data.records[0].getSubfield('950').data === 'C');
try {
  data.records[0].getSubfield(null, 'a');
} catch (err) {
  assert(err.message === 'tags must be specified');
}

/*
 * MarcRecord.getSubfieldData()
 */
assert(data.records[0].getSubfieldData('900', 'a') === 'A');
assert(data.records[0].getSubfieldData('555', 'a') === null);
assert(data.records[0].getSubfieldData(/^9../, 'b') === 'B');
assert(data.records[0].getSubfieldData(/^9../, 'a') === null);
assert(data.records[0].getSubfieldData(['555', /^9../], 'c') === 'C');
assert(data.records[0].getSubfieldData('950', ['a', 'b', 'c']) === 'C');
assert(data.records[0].getSubfieldData('950') === 'C');
try {
  data.records[0].getSubfieldData(null, 'a');
} catch (err) {
  assert(err.message === 'tags must be specified');
}

/*
 * MarcRecord.getRegularSubfield()
 */
assert(data.records[0].getRegularSubfield('900', 'a').data === 'A');
assert(data.records[0].getRegularSubfield('900', null, /^A/).data === 'A');
assert(data.records[0].getRegularSubfield(
  /^9../, ['b', 'c'], /^B/).data === 'B');
assert(data.records[0].getRegularSubfield('555', null, /^A/) === null);
assert(data.records[0].getRegularSubfield(
  '950', ['a', 'b', 'c', '1']).data === 'C');
assert(data.records[0].getRegularSubfield(/^9../, 'a') === null);
try {
  data.records[0].getRegularSubfield(null, null, /^A/);
} catch (err) {
  assert(err.message === 'tags must be specified');
}

/*
 * MarcRecord.getRegularSubfieldData()
 */
assert(data.records[0].getRegularSubfieldData('900', 'a') === 'A');
assert(data.records[0].getRegularSubfieldData('900', null, /^A/) === 'A');
assert(data.records[0].getRegularSubfieldData(
  /^9../, ['b', 'c'], /^B/) === 'B');
assert(data.records[0].getRegularSubfieldData('555', null, /^A/) === null);
assert(data.records[0].getRegularSubfieldData(
  '950', ['a', 'b', 'c', '1']) === 'C');
assert(data.records[0].getRegularSubfieldData(/^9../, 'a') === null);
try {
  data.records[0].getRegularSubfieldData(null, null, /^A/);
} catch (err) {
  assert(err.message === 'tags must be specified');
}

/*
 * MarcRecord.getLeader()
 */
assert(data.records[0].getLeader() === data.records[0].leader);

/*
 * MarcRecord.setLeader()
 */
var record = new MarcRecord();
record.setLeader('12345');
assert(record.getLeader() === '12345');

/*
 * MarcRecord.sort()
 */
var record = new MarcRecord(data.records[1]);
record.sort();
assert(record.fields[0].tag === '001');

/*
 * MarcRecord.parse()
 */
var jsonRecord = JSON.stringify(data.records[0]);
assert(data.records[0].equals(MarcRecord.parse(jsonRecord)));
assert(data.records[0].equals(MarcRecord.parse(JSON.parse(jsonRecord))));

/*
 * MarcRecord.toString()
 */
assert(data.records[0].toString().split('\n').length === 5);

/*
 * MarcRecord.toEmbeddedFields()
 */
var embeddedFields = data.records[0].toEmbeddedFields();
assert(embeddedFields.length === 4
  && embeddedFields.every(function (v) { return v.isEmbeddedField(); }));

var fields = data.records[0].getVariableFields('900');
var embeddedFields = MarcRecord.toEmbeddedFields(fields);
assert(embeddedFields.length === 2
  && embeddedFields.every(function (v) { return v.isEmbeddedField(); }));

console.error('OK');
