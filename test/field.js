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
 * MarcVariableField constructor.
 */
var field = new MarcVariableField('001');
assert(field.tag === '001');
var field = new MarcVariableField();
assert(field.tag === '???');

/*
 * MarcVariableField.isControlField()
 */
assert(data.records[0].fields[0].isControlField());
assert(!data.records[0].fields[1].isControlField());

/*
 * MarcVariableField.isDataField()
 */
assert(!data.records[0].fields[0].isDataField());
assert(data.records[0].fields[1].isDataField());

/*
 * MarcVariableField.equals()
 */
var field1 = data.records[0].fields[0];
var field2 = data.records[0].fields[1];
var field3 = data.records[0].fields[2];

assert(MarcVariableField.equals(field1, field1));
assert(MarcVariableField.equals(field1, field1, true));
assert(MarcVariableField.equals(field2, field2));
assert(MarcVariableField.equals(field2, field2, true));
assert(!MarcVariableField.equals(field1, field2));
assert(!MarcVariableField.equals(field1, field2, true));
assert(!MarcVariableField.equals(field2, field3));
assert(!MarcVariableField.equals(field2, field3, true));

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
 * MarcVariableField.getTag()
 */
assert(data.records[0].fields[0].getTag() === '001');
assert(data.records[0].fields[1].getTag() === '950');

/*
 * MarcVariableField.setTag()
 */
var field = new MarcVariableField();
field.setTag('555');
assert(field.tag === '555');

/*
 * MarcVariableField.parse()
 */
var field = data.records[0].fields[0];
var jsonField = JSON.parse(JSON.stringify(field));
assert(field.equals(MarcVariableField.parse(jsonField)));

var field = data.records[0].fields[1];
var jsonField = JSON.parse(JSON.stringify(field));
assert(field.equals(MarcVariableField.parse(jsonField)));

/*
 * MarcControlField constructor.
 */
var field = new MarcControlField('001', 'ID1');
assert(field.tag === '001' && field.data === 'ID1');

var field = new MarcControlField(data.records[0].fields[0]);
assert(field.tag === '001' && field.data === 'ID/1');

/*
 * MarcControlField.equals()
 */
var field1 = data.records[0].fields[0];
var field2 = new MarcControlField(field1);
var field3 = data.records[0].fields[1];

assert(field1.equals(field1));
assert(field1.equals(field2));
assert(!field1.equals(field3));

assert(MarcControlField.equals(field1, field1));
assert(MarcControlField.equals(field1, field2));
assert(!MarcControlField.equals(field1, field3));

assert(data.records[0].getControlNumberField().equals(
  data.records[0].getControlNumberField()));
assert(!data.records[0].getControlNumberField().equals(
  data.records[1].getControlNumberField()));

assert(MarcControlField.equals(data.records[0].getControlNumberField(),
  data.records[0].getControlNumberField()));
assert(!MarcControlField.equals(data.records[0].getControlNumberField(),
  data.records[1].getControlNumberField()));

/*
 * MarcControlField.getData()
 */
assert(data.records[0].fields[0].getData() === 'ID/1');

/*
 * MarcControlField.setData()
 */
var field = new MarcControlField('001');
field.setData('ID1');
assert(field.data === 'ID1');

/*
 * MarcControlField.toString()
 */
assert(data.records[0].fields[0].toString() === '001 ID/1');

/*
 * MarcDataField constructor.
 */
var field = new MarcDataField('555', '1', '2');
assert(field.tag === '555' && field.ind1 === '1' && field.ind2 === '2');

var field = new MarcDataField('555', '1', '2', [new MarcSubfield('a', 'A')]);
assert(field.subfields.length === 1);

var field = new MarcDataField(data.records[0].fields[1]);
assert(field.tag === '950' && field.ind1 === '3' && field.ind2 === '4'
  && field.subfields.length === 5);

/*
 * MarcDataField.equals()
 */
var field1 = data.records[0].fields[1];
var field2 = new MarcDataField(field1);
var field3 = data.records[0].fields[2];
var field4 = data.records[0].fields[3];
var field5 = new MarcDataField(field1);
field5.sort();

assert(field1.equals(field1));
assert(field1.equals(field1, true));
assert(field1.equals(field2));
assert(field1.equals(field2, true));
assert(!field1.equals(field3));
assert(!field1.equals(field3, true));
assert(!field1.equals(field4));
assert(!field1.equals(field4, true));
assert(!field1.equals(field5));
assert(field1.equals(field5, true));

assert(MarcDataField.equals(field1, field1));
assert(MarcDataField.equals(field1, field1, true));
assert(MarcDataField.equals(field1, field2));
assert(MarcDataField.equals(field1, field2, true));
assert(!MarcDataField.equals(field1, field3));
assert(!MarcDataField.equals(field1, field3, true));
assert(!MarcDataField.equals(field1, field4));
assert(!MarcDataField.equals(field1, field4, true));
assert(!MarcDataField.equals(field1, field5));
assert(MarcDataField.equals(field1, field5, true));

assert(!MarcDataField.equals(data.records[1].getVariableField('100'),
  data.records[2].getVariableField('100')));
assert(MarcDataField.equals(data.records[1].getVariableField('100'),
  data.records[2].getVariableField('100'), true));

var subfields1 = data.records[1].getVariableField('100').getSubfields();
var subfields2 = data.records[2].getVariableField('100').getSubfields();
assert(!MarcDataField.equals(subfields1, subfields2));
assert(MarcDataField.equals(subfields1, subfields2, true));

/*
 * MarcDataField.size()
 */
assert(data.records[0].fields[1].size() === 5);
assert(data.records[0].fields[2].size() === 3);

/*
 * MarcDataField.getIndicator1()
 */
assert(data.records[0].fields[1].getIndicator1() === '3');
assert(data.records[0].fields[2].getIndicator1() === '1');

/*
 * MarcDataField.setIndicator1()
 */
var field = new MarcDataField('555');
field.setIndicator1('9');
assert(field.ind1 === '9');

/*
 * MarcDataField.getIndicator2()
 */
assert(data.records[0].fields[1].getIndicator2() === '4');
assert(data.records[0].fields[2].getIndicator2() === '2');

/*
 * MarcDataField.setIndicator2()
 */
var field = new MarcDataField('555');
field.setIndicator2('9');
assert(field.ind2 === '9');

/*
 * MarcDataField.getSubfields()
 */
var field = data.records[0].fields[1];
assert(field.getSubfields().length === 5);
assert(field.getSubfields('b').length === 1);
assert(field.getSubfields('z').length === 0);
assert(field.getSubfields(['z', 'b', 'c']).length === 2);

/*
 * MarcDataField.getSubfield()
 */
var field = data.records[0].fields[1];
assert(field.getSubfield().data === 'C');
assert(field.getSubfield('b').data === 'B');
assert(field.getSubfield('z') === null);
assert(field.getSubfield(['z', 'b', 'c']).data === 'C');

/*
 * MarcDataField.getSubfieldData()
 */
var field = data.records[0].fields[1];
assert(field.getSubfieldData() === 'C');
assert(field.getSubfieldData('b') === 'B');
assert(field.getSubfieldData('z') === null);
assert(field.getSubfieldData(['z', 'b', 'c']) === 'C');

/*
 * MarcDataField.addSubfield()
 */
var field = new MarcDataField('555');
field.addSubfield(new MarcSubfield('a', 'A'));
assert(field.subfields.length === 1 && field.subfields[0].data === 'A');
field.addSubfield(new MarcSubfield('b', 'B'));
assert(field.subfields.length === 2 && field.subfields[1].data === 'B');
field.addSubfield(0, new MarcSubfield('c', 'C'));
assert(field.subfields.length === 3 && field.subfields[0].data === 'C');

/*
 * MarcDataField.removeSubfield()
 */
var field = new MarcDataField(data.records[0].fields[1]);
field.removeSubfield(field.subfields[0]);
assert(field.subfields.length === 4 && field.subfields[0].data === 'B');
field.removeSubfield(field.subfields[1]);
assert(field.subfields.length === 3);

/*
 * MarcDataField.getVariableFields()
 */
var field = data.records[0].fields[1];
assert(field.getVariableFields().length === 3);
assert(field.getVariableFields('001').length === 1);
assert(field.getVariableFields(/9../).length === 2);
assert(field.getVariableFields(['001', '905']).length === 3);
assert(field.getVariableFields(['001', /9../]).length === 3);
assert(field.getVariableFields('005').length === 0);

/*
 * MarcDataField.getVariableField()
 */
var field = data.records[0].fields[1];
assert(field.getVariableField().tag === '905');
assert(field.getVariableField('001').tag === '001');
assert(field.getVariableField(/9../).tag === '905');
assert(field.getVariableField(['001', '905']).tag === '905');
assert(field.getVariableField(['001', /9../]).tag === '905');
assert(field.getVariableField('005') === null);

/*
 * MarcDataField.getControlFieldData()
 */
var field = data.records[0].fields[1];
assert(field.getControlFieldData('001') === '2');
assert(field.getControlFieldData(/0../) === '2');
assert(field.getControlFieldData(['005', /0../]) === '2');
assert(field.getControlFieldData('005') === null);

/*
 * MarcDataField.getControlNumberField()
 */
assert(data.records[0].fields[1].getControlNumberField().data === '2');
assert(data.records[0].fields[2].getControlNumberField() === null);

/*
 * MarcDataField.getControlNumber()
 */
assert(data.records[0].fields[1].getControlNumber() === '2');
assert(data.records[0].fields[2].getControlNumber() === null);

/*
 * MarcDataField.addVariableField()
 */
var field = new MarcDataField('555');
field.addVariableField(data.records[0].fields[0]);
assert(field.subfields.length === 1 && field.subfields[0].data.tag === '001');
field.addVariableField(0, data.records[0].fields[2]);
assert(field.subfields.length === 2 && field.subfields[0].data.tag === '900');

/*
 * MarcDataField.removeVariableField()
 */
var field = new MarcDataField(data.records[0].fields[1]);
field.removeVariableField(field.getVariableField('001'));
assert(field.subfields.length === 4);

/*
 * MarcDataField.sort()
 */
var field = new MarcDataField(data.records[0].fields[1]);
field.sort();
assert(field.subfields[0].code === 'b');
assert(field.subfields[1].code === 'c');
assert(field.getVariableField().tag === '001');

/*
 * MarcDataField.toString()
 */
assert(data.records[0].fields[3].toString() === '900 [34] $z Z $x X $y Y');

/*
 * MarcSubfield constructor.
 */
var subfield = new MarcSubfield();
assert(subfield.code === '?' && subfield.data === '');

var subfield = new MarcSubfield('a', 'A');
assert(subfield.code === 'a' && subfield.data === 'A');

var subfield = new MarcSubfield(data.records[0].fields[1].subfields[0]);
assert(subfield.code === 'c' && subfield.data === 'C');

var subfield = new MarcSubfield(data.records[0].fields[1].subfields[3]);
assert(subfield.data.isControlField() && subfield.data.tag === '001');

var subfield = new MarcSubfield(data.records[0].fields[1].subfields[2]);
assert(subfield.data.isDataField() && subfield.data.tag === '905');

/*
 * MarcSubfield.equals()
 */
var subfield1 = data.records[0].fields[1].subfields[0];
var subfield2 = new MarcSubfield(subfield1);
var subfield3 = data.records[0].fields[1].subfields[1];
var subfield4 = data.records[0].fields[1].subfields[2];
var subfield5 = new MarcSubfield(subfield4);
subfield5.data.sort();

assert(subfield1.equals(subfield1));
assert(subfield1.equals(subfield1, true));
assert(subfield1.equals(subfield2));
assert(subfield1.equals(subfield2, true));
assert(!subfield1.equals(subfield3));
assert(!subfield1.equals(subfield3, true));
assert(!subfield4.equals(subfield5));
assert(subfield4.equals(subfield5, true));

assert(MarcSubfield.equals(subfield1, subfield1));
assert(MarcSubfield.equals(subfield1, subfield1, true));
assert(MarcSubfield.equals(subfield1, subfield2));
assert(MarcSubfield.equals(subfield1, subfield2, true));
assert(!MarcSubfield.equals(subfield1, subfield3));
assert(!MarcSubfield.equals(subfield1, subfield3, true));
assert(!MarcSubfield.equals(subfield4, subfield5));
assert(MarcSubfield.equals(subfield4, subfield5, true));

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

/*
 * MarcSubfield.isEmbeddedField()
 */
assert(!data.records[0].fields[1].subfields[0].isEmbeddedField());
assert(data.records[0].fields[1].subfields[2].isEmbeddedField());

/*
 * MarcSubfield.getCode()
 */
assert(data.records[0].fields[1].subfields[0].getCode() === 'c');
assert(data.records[0].fields[1].subfields[3].getCode() === '1');

/*
 * MarcSubfield.setCode()
 */
var subfield = new MarcSubfield();
subfield.setCode('9');
assert(subfield.code === '9');

/*
 * MarcSubfield.getData()
 */
assert(data.records[0].fields[1].subfields[0].getData() === 'C');
assert(data.records[0].fields[1].subfields[3].getData().isControlField());

/*
 * MarcSubfield.setData()
 */
var subfield = new MarcSubfield('9');
subfield.setData('text');
assert(subfield.data === 'text');

/*
 * MarcSubfield.parse()
 */
var subfield = data.records[0].fields[1].subfields[0];
var jsonSubfield = JSON.parse(JSON.stringify(subfield));
assert(subfield.equals(MarcSubfield.parse(jsonSubfield)));

var subfield = data.records[0].fields[1].subfields[2];
var jsonSubfield = JSON.parse(JSON.stringify(subfield));
assert(subfield.equals(MarcSubfield.parse(jsonSubfield)));

var subfield = data.records[0].fields[1].subfields[3];
var jsonSubfield = JSON.parse(JSON.stringify(subfield));
assert(subfield.equals(MarcSubfield.parse(jsonSubfield)));

/*
 * MarcSubfield.toString()
 */
assert(data.records[0].fields[1].subfields[0].toString() === '$c C');
assert(data.records[0].fields[1].subfields[2].toString()
  === '$1 905 [56] $z Z $a A');
assert(data.records[0].fields[1].subfields[3].toString() === '$1 001 2');

console.error('OK');
