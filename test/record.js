var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

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

var fields = [
  new MarcControlField('001', 'ID1'),
  new MarcControlField('005', '20160101102030.1')
];
var record = new MarcRecord(fields);
assert(record.fields.length === 2
  && record.fields[0].tag === '001' && record.fields[0].data === 'ID1');

/*
 * MarcRecord.parse()
 * MarcRecord.parseJson()
 * MarcRecord.parseText()
 */
var record = new MarcRecord([
  new MarcControlField('001', 'ID1'),
  new MarcDataField('111', '2', '3', [
    new MarcSubfield('a', 'AAA'),
    new MarcSubfield('b', 'BBB')
  ]),
  new MarcDataField('222', '3', '4', [
    new MarcSubfield('c', 'CCC'),
    new MarcSubfield('d', 'DDD')
  ]),
  new MarcDataField('444', '5', '6', [
    new MarcSubfield('1', new MarcControlField('001', 'ID2')),
    new MarcSubfield('1', new MarcDataField('100', '2', '3', [
      new MarcSubfield('x', 'XXX'),
      new MarcSubfield('y', 'YYY')
    ]))
  ])
]);
var textRecord = '000      nam  22        450 \n'
  + '001 ID1\n'
  + '111 23$aAAA$bBBB\n'
  + '222 34$cCCC$dDDD\n'
  + '444 56$1001ID2$110023$xXXX$yYYY';

assert(record.equals(MarcRecord.parse(record)));
assert(record.equals(MarcRecord.parse(JSON.stringify(record))));
assert(record.equals(MarcRecord.parse(textRecord)));
assert(record.equals(MarcRecord.parseJson(record)));
assert(record.equals(MarcRecord.parseText(textRecord)));

/*
 * MarcRecord.clone()
 */
var record = MarcRecord.parse('000      nam  22        450 \n'
  + '001 ID1\n'
  + '111 23$aAAA$bBBB\n'
  + '222 34$cCCC$dDDD\n'
  + '444 56$1001ID2$110023$xXXX$yYYY');
var recordClone = record.clone();
assert(recordClone !== record && recordClone.equals(record));
assert(MarcRecord.clone({}) === null);

/*
 * MarcRecord.assign()
 */
var record1 = MarcRecord.parse('001 ID1\n111 23$aAAA$bBBB');
var record2 = MarcRecord.parse('111 23$bBBB$aAAA\n001 ID1');
record1.assign(record2);
assert(record1 !== record2 && record1.equals(record2));

/*
 * MarcRecord.equals()
 */
var record1 = MarcRecord.parse('001 ID1\n111 23$aAAA$bBBB');
var record2 = MarcRecord.parse('111 23$bBBB$aAAA\n001 ID1');
var record3 = MarcRecord.parse('111 23$bbBb$aAaA\n001 ID1');
var record4 = MarcRecord.parse('001 ID1\n444 56$1001ID2$110023$xXXX$yYYY');
var record5 = MarcRecord.parse('444 56$110023$yYYY$xXXX$1001ID2\n001 ID1');

assert(record1.equals(record1));
assert(record1.equals(record1.clone()));

assert(!record1.equals(record2));
assert(record1.equals(record2, {ignoreOrder: true}));

assert(!record2.equals(record3));
assert(record2.equals(record3, {ignoreCase: true}));
assert(record1.equals(record3, {ignoreOrder: true, ignoreCase: true}));

assert(record4.equals(record4.clone()));
assert(!record4.equals(record5));
assert(record4.equals(record5, {ignoreOrder: true}));

/*
 * MarcRecord.size()
 */
var record1 = new MarcRecord();
var record2 = MarcRecord.parse('001 ID1');
var record3 = MarcRecord.parse('001 ID1\n111 23$aAAA$bBBB');
assert(record1.size() === 0 && record2.size() === 1 && record3.size() === 2);

/*
 * MarcRecord.empty()
 */
var record1 = new MarcRecord();
var record2 = MarcRecord.parse('001 ID1');
assert(record1.empty() && !record2.empty());

/*
 * MarcRecord.clear()
 */
var record = MarcRecord.parse('001 ID1');
record.clear();
assert(record.fields.length === 0);

/*
 * MarcRecord.trim()
 */
var record = MarcRecord.parse('001 ID1\n005 \n111 23$aAAA$b$cCCC$d');
record.trim();
assert(record.fields.length === 2 && record.fields[1].subfields.length === 2);

/*
 * MarcRecord.addVariableField()
 */
var record = new MarcRecord();
record.addVariableField(new MarcControlField('001', 'ID1'));
record.addVariableField(
  new MarcDataField('200', ' ', ' ', [new MarcSubfield('a', 'AAA')]));
assert(record.fields.length === 2);

/*
 * MarcRecord.addNonEmptyVariableField()
 */
var record = new MarcRecord();
record.addNonEmptyVariableField(new MarcControlField('001', 'ID1'));
record.addNonEmptyVariableField(new MarcControlField('005', ''));
record.addNonEmptyVariableField(new MarcControlField('007', null));
record.addNonEmptyVariableField(
  new MarcDataField('200', ' ', ' ', [new MarcSubfield('a', 'AAA')]));
record.addNonEmptyVariableField(new MarcDataField('200'));
assert(record.fields.length === 2);

/*
 * MarcRecord.removeVariableFields()
 */
var record = MarcRecord.parse('001 ID1\n111 23$aAAA$bBBB\n222 34$cCCC$dDDD');
record.removeVariableFields(record.getVariableFields('111'));
assert(record.fields.length === 2);
record.removeVariableFields([1]);
assert(record.fields.length === 1);
record.removeVariableFields(record.getVariableFields());
assert(record.fields.length === 0);

/*
 * MarcRecord.removeVariableField()
 */
var record = MarcRecord.parse('001 ID1\n111 23$aAAA$bBBB\n222 34$cCCC$dDDD');
record.removeVariableField(record.fields[0]);
assert(record.fields.length === 2);
record.removeVariableField(1);
assert(record.fields.length === 1);
record.removeVariableField(record.fields[0]);
assert(record.fields.length === 0);

/*
 * MarcRecord.getVariableFields()
 */
var record = MarcRecord.parse(
  '001 ID1\n111 23$aAAA$bBBB\n111 23$cCCC$dDDD\n122 34$eEEE$fFFF');
assert(record.getVariableFields().length === 4);
assert(record.getVariableFields('001').length === 1);
assert(record.getVariableFields('111').length === 2);
assert(record.getVariableFields('333').length === 0);
assert(record.getVariableFields(/^1..$/).length === 3);
assert(record.getVariableFields(/^3..$/).length === 0);
assert(record.getVariableFields(['122', '001']).length === 2);
assert(record.getVariableFields([/^12/, '001', /^0/]).length === 2);
assert(record.getVariableFields(['007', /^3/]).length === 0);

/*
 * MarcRecord.getVariableField()
 */
var record = MarcRecord.parse(
  '001 ID1\n111 23$aAAA$bBBB\n111 23$cCCC$dDDD\n122 34$eEEE$fFFF');
assert(record.getVariableField().tag === '001');
assert(record.getVariableField('001').tag === '001');
assert(record.getVariableField('111').tag === '111');
assert(record.getVariableField('333') === null);
assert(record.getVariableField(/^1..$/).tag === '111');
assert(record.getVariableField(/^3..$/) === null);
assert(record.getVariableField(['122', '001']).tag === '001');
assert(record.getVariableField([/^12/, '001', /^0/]).tag === '001');
assert(record.getVariableField(['007', /^3/]) === null);

/*
 * MarcRecord.getControlFields()
 */
var record = MarcRecord.parse('001 ID1\n005 20160101102030.1\n111 23$aAAA');
assert(record.getControlFields().length === 2);
assert(record.getControlFields('001').length === 1);
assert(record.getControlFields('007').length === 0);
assert(record.getControlFields('111').length === 0);
assert(record.getControlFields(/^0../).length === 2);
assert(record.getControlFields(/^007/).length === 0);
assert(record.getControlFields(['005', '001']).length === 2);
assert(record.getControlFields([/^005/, '001', /^0/]).length === 2);
assert(record.getControlFields(['007', /^008/]).length === 0);

/*
 * MarcRecord.getDataFields()
 */
var record = MarcRecord.parse(
  '001 ID1\n111 23$aAAA$bBBB\n111 23$cCCC$dDDD\n122 34$eEEE$fFFF\n234 #1$xX');

assert(record.getDataFields().length === 4);
assert(record.getDataFields('111').length === 2);
assert(record.getDataFields('333').length === 0);
assert(record.getDataFields('001').length === 0);
assert(record.getDataFields(/^1..$/).length === 3);
assert(record.getDataFields(/^3..$/).length === 0);
assert(record.getDataFields(['122', '001']).length === 1);
assert(record.getDataFields([/^1/, '001', /^0/]).length === 3);
assert(record.getDataFields(['007', /^3/]).length === 0);

assert(record.getDataFields('122', '3').length === 1);
assert(record.getDataFields('122', '3', '4').length === 1);
assert(record.getDataFields('122', '1', '1').length === 0);
assert(record.getDataFields(/^1../, '2', '3').length === 2);

assert(record.getDataFields('234', '#', '1').length === 1);
assert(record.getDataFields('234', ' ', '1').length === 0);
assert(record.getDataFields('234', ' ', '1',
  {normalizeIndicators: true}).length === 1);

/*
 * MarcRecord.getControlFieldData()
 */
var record = MarcRecord.parse('001 ID1\n005 20160101102030.1\n111 23$aAAA');
assert(record.getControlFieldData() === 'ID1');
assert(record.getControlFieldData('001') === 'ID1');
assert(record.getControlFieldData('007') === null);
assert(record.getControlFieldData('111') === null);
assert(record.getControlFieldData(/^0../) === 'ID1');
assert(record.getControlFieldData(/^007/) === null);
assert(record.getControlFieldData(['005', '001']) === 'ID1');
assert(record.getControlFieldData([/^005/, '001', /^0/]) === 'ID1');
assert(record.getControlFieldData(['007', /^008/]) === null);

/*
 * MarcRecord.getControlNumber()
 */
var record1 = MarcRecord.parse('001 ID1\n111 23$aAAA');
var record2 = MarcRecord.parse('222 34$bBBB\n001 ID2');
assert(record1.getControlNumber() === 'ID1');
assert(record2.getControlNumber() === 'ID2');
assert((new MarcRecord()).getControlNumber() === null);

/*
 * MarcRecord.getSubfield()
 */
var record = MarcRecord.parse(
  '001 ID1\n111 23$aAAA$bBBB\n111 23$cCCC$dDDD\n122 34$eEEE$fFFF');
assert(record.getSubfield('111', 'a').data === 'AAA');
assert(record.getSubfield('333', 'a') === null);
assert(record.getSubfield(/^1../, 'b').data === 'BBB');
assert(record.getSubfield(/^12./, 'a') === null);
assert(record.getSubfield(['333', /^12./], 'e').data === 'EEE');
assert(record.getSubfield('122', ['a', 'c', 'e']).data === 'EEE');
assert(record.getSubfield('122').data === 'EEE');
try {
  record.getSubfield(null, 'a');
} catch (err) {
  assert(err.message === 'tags must be specified');
}

/*
 * MarcRecord.getSubfieldData()
 */
var record = MarcRecord.parse(
  '001 ID1\n111 23$aAAA$bBBB\n111 23$cCCC$dDDD\n122 34$eEEE$fFFF');
assert(record.getSubfieldData('111', 'a') === 'AAA');
assert(record.getSubfieldData('333', 'a') === null);
assert(record.getSubfieldData(/^1../, 'b') === 'BBB');
assert(record.getSubfieldData(/^12./, 'a') === null);
assert(record.getSubfieldData(['333', /^12./], 'e') === 'EEE');
assert(record.getSubfieldData('122', ['a', 'c', 'e']) === 'EEE');
assert(record.getSubfieldData('122') === 'EEE');
try {
  record.getSubfieldData(null, 'a');
} catch (err) {
  assert(err.message === 'tags must be specified');
}

/*
 * MarcRecord.getRegularSubfield()
 */
var record = MarcRecord.parse(
  '001 ID1\n111 23$aAAA$bBBB\n111 23$cCCC$dDDD\n122 34$eEEE$fFFF');
assert(record.getRegularSubfield('111', 'a').data === 'AAA');
assert(record.getRegularSubfield('111', null, /^A/).data === 'AAA');
assert(record.getRegularSubfield(
  /^1../, ['b', 'c'], /^B/).data === 'BBB');
assert(record.getRegularSubfield('333', null, /^A/) === null);
assert(record.getRegularSubfield(
  '122', ['a', 'c', 'e', '1']).data === 'EEE');
assert(record.getRegularSubfield(/^12./, 'a') === null);
try {
  record.getRegularSubfield(null, null, /^A/);
} catch (err) {
  assert(err.message === 'tags must be specified');
}

/*
 * MarcRecord.getRegularSubfieldData()
 */
var record = MarcRecord.parse(
  '001 ID1\n111 23$aAAA$bBBB\n111 23$cCCC$dDDD\n122 34$eEEE$fFFF');
assert(record.getRegularSubfieldData('111', 'a') === 'AAA');
assert(record.getRegularSubfieldData('111', null, /^A/) === 'AAA');
assert(record.getRegularSubfieldData(
  /^1../, ['b', 'c'], /^B/) === 'BBB');
assert(record.getRegularSubfieldData('333', null, /^A/) === null);
assert(record.getRegularSubfieldData(
  '122', ['a', 'c', 'e', '1']) === 'EEE');
assert(record.getRegularSubfieldData(/^12./, 'a') === null);
try {
  record.getRegularSubfieldData(null, null, /^A/);
} catch (err) {
  assert(err.message === 'tags must be specified');
}

/*
 * MarcRecord.findControlFields()
 */
var record = MarcRecord.parse(
  '001 ID1\n005 20160101102030.1\n111 23$aAAA$bBBB');
assert(record.findControlFields('005', /^2016/).length === 1);
assert(record.findControlFields(/^00./).length === 2);
assert(record.findControlFields(['001', '005'], /.*1.*/).length === 2);
assert(record.findControlFields('111').length === 0);
try {
  record.findControlFields(null, /^2016/);
} catch (err) {
  assert(err.message === 'tags must be specified');
}

/*
 * MarcRecord.findDataFields()
 */
var record = MarcRecord.parse(
  '001 ID1\n111 23$aAAA$bBBB\n111 24$cCCC$dDDD\n122 34$eEEE$fFFF');
assert(record.findDataFields('111', null, null, 'a').length === 1);
assert(record.findDataFields('111', null, null, ['a', 'c']).length === 2);
assert(record.findDataFields('111', '2', null, ['a', 'c']).length === 2);
assert(record.findDataFields('111', '2', '3', ['a', 'c']).length === 1);
assert(record.findDataFields('111', null, null, ['a', 'c'], 'AAA').length === 1);
assert(record.findDataFields('111', null, null, ['a', 'c'], /AAA|CCC/).length === 2);
try {
  record.findDataFields(null, null, null, 'a');
} catch (err) {
  assert(err.message === 'tags must be specified');
}

/*
 * MarcRecord.getLeader()
 */
var record = MarcRecord.parse('000      nam  22        450 \n001 ID1');
assert(record.getLeader() === record.leader);

/*
 * MarcRecord.setLeader()
 */
var record = new MarcRecord();
record.setLeader('12345');
assert(record.getLeader() === '12345');

/*
 * MarcRecord.sort()
 */
var record = MarcRecord.parse(
  '222 45$cCCC\n001 ID1\n111 23$bBBB\n111 34$aAAA');
record.sort();
assert(record.fields[0].tag === '001'
  && record.fields[1].tag === '111' && record.fields[1].ind1 === '2'
  && record.fields[2].tag === '111' && record.fields[2].ind1 === '3'
  && record.fields[3].tag === '222');

/*
 * MarcRecord.walk()
 */
var record1 = MarcRecord.parse('000      nam  22        450 \n'
  + '001 ID1\n'
  + '111 23$aAAA$bBBB\n'
  + '222 34$cCCC$dDDD\n'
  + '444 56$1001ID2$110023$xXXX$yYYY');
var record2 = MarcRecord.parse('000      nam  22        450 \n'
  + '001 ID*\n'
  + '111 23$aAAA$b***\n'
  + '222 34$c***$dDDD\n'
  + '444 56$1001ID*$110023$x***$yYYY');
record1.walk(function (item) {
  if (typeof(item.data) === 'string') {
    item.data = item.data.replace(/[12BCX]/g, '*');
  }
});
assert(record1.equals(record2));

/*
 * MarcRecord.toString()
 */
var textRecord = '000 12345nam  22#####   450 \n'
  + '001 ID1\n'
  + '123 45$aABC$bBBB\n'
  + '321 54$cCCC$dDDD';
var record = MarcRecord.parseText(textRecord);
assert(record.toString() === textRecord);

/*
 * MarcRecord.toEmbeddedFields()
 */
var record = MarcRecord.parse(
  '001 ID1\n111 23$aAAA$bBBB\n111 23$cCCC$dDDD\n122 34$eEEE$fFFF');

var embeddedFields = record.toEmbeddedFields();
assert(embeddedFields.length === 4
  && embeddedFields.every(function (v) { return v.isEmbeddedField(); }));

var fields = record.getVariableFields('111');
var embeddedFields = MarcRecord.toEmbeddedFields(fields);
assert(embeddedFields.length === 2
  && embeddedFields.every(function (v) { return v.isEmbeddedField(); }));

console.error('OK');
