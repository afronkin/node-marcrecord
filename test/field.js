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
 * MarcVariableField constructor.
 */
var field = new MarcVariableField('001');
assert(field.tag === '001');
var field = new MarcVariableField();
assert(field.tag === '???');

/*
 * MarcVariableField.parse()
 * MarcVariableField.parseJson()
 * MarcVariableField.parseText()
 */
var field = MarcControlField('001', 'ID1');
var textField = '001 ID1';
assert(field.equals(MarcVariableField.parse(field)));
assert(field.equals(MarcVariableField.parse(JSON.stringify(field))));
assert(field.equals(MarcVariableField.parse(textField)));
assert(field.equals(MarcVariableField.parseJson(field)));
assert(field.equals(MarcVariableField.parseText(textField)));

var field = new MarcDataField('111', '2', '3', [
  new MarcSubfield('a', 'AAA'),
  new MarcSubfield('b', 'BBB')
]);
var textField = '111 23$aAAA$bBBB';
assert(field.equals(MarcVariableField.parse(field)));
assert(field.equals(MarcVariableField.parse(JSON.stringify(field))));
assert(field.equals(MarcVariableField.parse(textField)));
assert(field.equals(MarcVariableField.parseJson(field)));
assert(field.equals(MarcVariableField.parseText(textField)));

var field = new MarcDataField('444', '5', '6', [
  new MarcSubfield('1', new MarcControlField('001', 'ID2')),
  new MarcSubfield('1', new MarcDataField('100', '2', '3', [
    new MarcSubfield('x', 'XXX'),
    new MarcSubfield('y', 'YYY')
  ]))
]);
var textField = '444 56$1001ID2$110023$xXXX$yYYY';
assert(field.equals(MarcVariableField.parse(field)));
assert(field.equals(MarcVariableField.parse(JSON.stringify(field))));
assert(field.equals(MarcVariableField.parse(textField)));
assert(field.equals(MarcVariableField.parseJson(field)));
assert(field.equals(MarcVariableField.parseText(textField)));

/*
 * MarcVariableField.clone()
 */
var field = MarcVariableField.parse('001 ID1');
var fieldClone = MarcVariableField.clone(field);
assert(fieldClone !== field && fieldClone.equals(field));
var fieldClone = field.clone();
assert(fieldClone !== field && fieldClone.equals(field));

var field = MarcVariableField.parse('111 23$aAAA$bBBB');
var fieldClone = MarcVariableField.clone(field);
assert(fieldClone !== field && fieldClone.equals(field));
var fieldClone = field.clone();
assert(fieldClone !== field && fieldClone.equals(field));

var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
var fieldClone = MarcVariableField.clone(field);
assert(fieldClone !== field && fieldClone.equals(field));
var fieldClone = field.clone();
assert(fieldClone !== field && fieldClone.equals(field));

var fieldClone = MarcVariableField.clone({});
assert(fieldClone === null);

/*
 * MarcVariableField.isControlField()
 */
var field1 = MarcVariableField.parse('001 ID1');
var field2 = MarcVariableField.parse('111 23$aAAA$bBBB');
assert(field1.isControlField() && !field2.isControlField());

/*
 * MarcVariableField.isDataField()
 */
var field1 = MarcVariableField.parse('001 ID1');
var field2 = MarcVariableField.parse('111 23$aAAA$bBBB');
assert(!field1.isDataField() && field2.isDataField());

/*
 * MarcVariableField.equals()
 */
var field1 = MarcVariableField.parse('001 ID1');
var field2 = MarcVariableField.parse('001 ID2');
var field3 = MarcVariableField.parse('001 id1');
var field4 = MarcVariableField.parse('005 ID1');
assert(MarcVariableField.equals(field1, field1));
assert(!MarcVariableField.equals(field1, field2));
assert(MarcVariableField.equals(field1, field2, {ignoreChars: /[0-9]/g}));
assert(!MarcVariableField.equals(field1, field3));
assert(MarcVariableField.equals(field1, field3, {ignoreCase: true}));
assert(!MarcVariableField.equals(field1, field4));

var field1 = MarcVariableField.parse('111 23$aAAA$bBBB');
var field2 = MarcVariableField.parse('111 23$aAAA$bBBBC');
var field3 = MarcVariableField.parse('111 23$bBBB$aAAA');
var field4 = MarcVariableField.parse('111 23$bBbB$aAaa');
var field5 = MarcVariableField.parse('222 23$aAAA$bBBB');
assert(MarcVariableField.equals(field1, field1));
assert(!MarcVariableField.equals(field1, field2));
assert(MarcVariableField.equals(field1, field2, {ignoreChars: /[c]/ig}));
assert(!MarcVariableField.equals(field1, field3));
assert(MarcVariableField.equals(field1, field3, {ignoreOrder: true}));
assert(!MarcVariableField.equals(field1, field4));
assert(MarcVariableField.equals(field1, field4,
  {ignoreOrder: true, ignoreCase: true}));
assert(!MarcVariableField.equals(field1, field5));

var field1 = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
var field2 = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYYZ');
var field3 = MarcVariableField.parse('444 56$110023$yYYY$xXXX$1001ID2');
var field4 = MarcVariableField.parse('444 56$110023$yYyY$xXXx$1001id2');
var field5 = MarcVariableField.parse('555 56$1001ID2$110023$xXXX$yYYY');
assert(MarcVariableField.equals(field1, field1));
assert(!MarcVariableField.equals(field1, field2));
assert(MarcVariableField.equals(field1, field2, {ignoreChars: /[z]/ig}));
assert(!MarcVariableField.equals(field1, field3));
assert(MarcVariableField.equals(field1, field3, {ignoreOrder: true}));
assert(!MarcVariableField.equals(field1, field4));
assert(MarcVariableField.equals(field1, field4,
  {ignoreOrder: true, ignoreCase: true}));
assert(!MarcVariableField.equals(field1, field5));

/*
 * MarcVariableField.getTag()
 */
var field = MarcVariableField.parse('001 ID1');
assert(field.getTag() === '001');
var field = MarcVariableField.parse('111 23$aAAA$bBBB');
assert(field.getTag() === '111');

/*
 * MarcVariableField.setTag()
 */
var field = new MarcVariableField();
field.setTag('555');
assert(field.tag === '555');

/*
 * MarcControlField constructor.
 */
var field = new MarcControlField('001', 'ID1');
assert(field.tag === '001' && field.data === 'ID1');

var field1 = new MarcControlField('001', 'ID1');
var field2 = new MarcControlField(field1);
assert(field1 !== field2 && field1.equals(field2));

/*
 * MarcControlField.clone()
 */
var field = MarcVariableField.parse('001 ID1');
var fieldClone = MarcControlField.clone(field);
assert(fieldClone !== field && fieldClone.equals(field));
var fieldClone = field.clone();
assert(fieldClone !== field && fieldClone.equals(field));

/*
 * MarcControlField.assign()
 */
var field1 = MarcVariableField.parse('001 ID1');
var field2 = MarcVariableField.parse('001 ID2');
field1.assign(field2);
assert(field1 !== field2 && field1.equals(field2));

/*
 * MarcControlField.equals()
 */
var field1 = MarcVariableField.parse('001 ID1');
var field2 = MarcVariableField.parse('001 ID2');
var field3 = MarcVariableField.parse('001 id1');
var field4 = MarcVariableField.parse('005 ID1');

assert(MarcControlField.equals(field1, field1));
assert(!MarcControlField.equals(field1, field2));
assert(MarcControlField.equals(field1, field2, {ignoreChars: /[0-9]/g}));
assert(!MarcControlField.equals(field1, field3));
assert(MarcControlField.equals(field1, field3, {ignoreCase: true}));
assert(!MarcControlField.equals(field1, field4));

assert(field1.equals(field1));
assert(!field1.equals(field2));
assert(field1.equals(field2, {ignoreChars: /[0-9]/g}));
assert(!field1.equals(field3));
assert(field1.equals(field3, {ignoreCase: true}));
assert(!field1.equals(field4));

/*
 * MarcControlField.empty()
 */
assert(!MarcVariableField.parse('001 ID1').empty());
assert(!(new MarcControlField('001', 'text')).empty());
assert((new MarcControlField('001')).empty());
assert((new MarcControlField('001', null)).empty());
assert((new MarcControlField('001', '')).empty());

/*
 * MarcControlField.getData()
 */
var field = MarcVariableField.parse('001 ID1');
assert(field.getData() === 'ID1' && field.getData() === field.data);

/*
 * MarcControlField.setData()
 */
var field = new MarcControlField('001');
field.setData('ID1');
assert(field.data === 'ID1');

/*
 * MarcControlField.toString()
 */
var field = new MarcControlField('001', 'ID1');
assert(field.toString() === '001 ID1');

/*
 * MarcDataField constructor.
 */
var field = new MarcDataField('111', '2', '3');
assert(field.tag === '111' && field.ind1 === '2' && field.ind2 === '3');

var field1 = new MarcDataField('111', '2', '3', [
  new MarcSubfield('a', 'AAA'),
  new MarcSubfield('b', 'BBB')
]);
var field2 = new MarcDataField(field1);
assert(field1.subfields.length === 2
  && field1.subfields[0].code === 'a' && field1.subfields[0].data === 'AAA'
  && field1.subfields[1].code === 'b' && field1.subfields[1].data === 'BBB');
assert(field1 !== field2 && field1.equals(field2));

/*
 * MarcDataField.clone()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB');
var fieldClone = MarcDataField.clone(field);
assert(fieldClone !== field && fieldClone.equals(field));
var fieldClone = field.clone();
assert(fieldClone !== field && fieldClone.equals(field));

var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
var fieldClone = MarcDataField.clone(field);
assert(fieldClone !== field && fieldClone.equals(field));
var fieldClone = field.clone();
assert(fieldClone !== field && fieldClone.equals(field));

var fieldClone = MarcDataField.clone({});
assert(fieldClone === null);

/*
 * MarcDataField.cloneSubfields()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
var subfields = field.getSubfields(['b', 'c']);
var subfieldsClone = MarcDataField.cloneSubfields(subfields);
assert(subfieldsClone !== subfields
  && JSON.stringify(subfieldsClone) === JSON.stringify(subfields));
var subfieldsClone = field.cloneSubfields();
assert(subfieldsClone !== field.subfields
  && JSON.stringify(subfieldsClone) === JSON.stringify(field.subfields));
var subfieldsClone = MarcDataField.cloneSubfields(subfields, {newCode: 'd'});
assert(subfieldsClone !== subfields
  && JSON.stringify(subfieldsClone) !== JSON.stringify(subfields));

/*
 * MarcDataField.assign()
 */
var field1 = MarcVariableField.parse('111 23$aAAA$bBBB');
var field2 = MarcVariableField.parse('111 23$aAAA$bBBBC');
field1.assign(field2);
assert(field1 !== field2 && field1.equals(field2));

/*
 * MarcDataField.equals()
 */
var field1 = MarcVariableField.parse('111 23$aAAA$bBBB');
var field2 = MarcVariableField.parse('111 23$aAAA$bBBBC');
var field3 = MarcVariableField.parse('111 23$bBBB$aAAA');
var field4 = MarcVariableField.parse('111 23$bBbB$aAaa');
var field5 = MarcVariableField.parse('222 23$aAAA$bBBB');
assert(MarcDataField.equals(field1, field1));
assert(!MarcDataField.equals(field1, field2));
assert(MarcDataField.equals(field1, field2, {ignoreChars: /[c]/ig}));
assert(!MarcDataField.equals(field1, field3));
assert(MarcDataField.equals(field1, field3, {ignoreOrder: true}));
assert(!MarcDataField.equals(field1, field4));
assert(MarcDataField.equals(field1, field4,
  {ignoreOrder: true, ignoreCase: true}));
assert(!MarcDataField.equals(field1, field5));

var field1 = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
var field2 = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYYZ');
var field3 = MarcVariableField.parse('444 56$110023$yYYY$xXXX$1001ID2');
var field4 = MarcVariableField.parse('444 56$110023$yYyY$xXXx$1001id2');
var field5 = MarcVariableField.parse('555 56$1001ID2$110023$xXXX$yYYY');
assert(MarcDataField.equals(field1, field1));
assert(!MarcDataField.equals(field1, field2));
assert(MarcDataField.equals(field1, field2, {ignoreChars: /[z]/ig}));
assert(!MarcDataField.equals(field1, field3));
assert(MarcDataField.equals(field1, field3, {ignoreOrder: true}));
assert(!MarcDataField.equals(field1, field4));
assert(MarcDataField.equals(field1, field4,
  {ignoreOrder: true, ignoreCase: true}));
assert(!MarcDataField.equals(field1, field5));

var field1 = MarcVariableField.parse('111 #1$aAAA$bBBB');
var field2 = MarcVariableField.parse('111  1$aAAA$bBBB');
assert(!MarcDataField.equals(field1, field2));
assert(MarcDataField.equals(field1, field2, {normalizeIndicators: true}));

/*
 * MarcDataField.size()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB');
assert(field.size() === 2);
var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
assert(field.size() === 2);

/*
 * MarcDataField.empty()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB');
assert(!field.empty());
var field = new MarcDataField('111', '2', '3');
assert(field.empty());

/*
 * MarcDataField.trim()
 */
var field = MarcVariableField.parse('111 23$aAAA$b$cCCC$d');
field.trim();
assert(field.subfields.length === 2);

/*
 * MarcDataField.getIndicator1()
 * MarcDataField.getIndicator2()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB');
assert(field.getIndicator1() === '2');
assert(field.getIndicator2() === '3');

/*
 * MarcDataField.setIndicator1()
 * MarcDataField.setIndicator2()
 */
var field = new MarcDataField('111');
field.setIndicator1('2');
assert(field.ind1 === '2');
field.setIndicator2('3');
assert(field.ind2 === '3');

/*
 * MarcDataField.getSubfields()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
assert(field.getSubfields().length === 3);
assert(field.getSubfields('b').length === 1);
assert(field.getSubfields('z').length === 0);
assert(field.getSubfields(['z', 'b', 'c']).length === 2);

var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
assert(field.getSubfields('1').length === 2);

/*
 * MarcDataField.getSubfield()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
assert(field.getSubfield().data === 'AAA');
assert(field.getSubfield('b').data === 'BBB');
assert(field.getSubfield('z') === null);
assert(field.getSubfield(['z', 'b', 'c']).data === 'BBB');

var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
assert(field.getSubfield('1').isEmbeddedField());

/*
 * MarcDataField.getSubfieldData()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
assert(field.getSubfieldData() === 'AAA');
assert(field.getSubfieldData('b') === 'BBB');
assert(field.getSubfieldData('z') === null);
assert(field.getSubfieldData(['z', 'b', 'c']) === 'BBB');

var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
assert(field.getSubfieldData('1').isControlField());

/*
 * MarcDataField.getRegularSubfields()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
assert(field.getRegularSubfields().length === 3);
assert(field.getRegularSubfields(null, /^BBB/).length === 1);
assert(field.getRegularSubfields(null, /[CZ]/).length === 1);
assert(field.getRegularSubfields(null, /^(BBB|CCC|ZZZ)$/).length === 2);
assert(field.getRegularSubfields(null, 'BBB').length === 1);
assert(field.getRegularSubfields('b', /^[BC]/).length === 1);
assert(field.getRegularSubfields(['b', 'c'], /^[C]/).length === 1);
assert(field.getRegularSubfields('c', 'CCC').length === 1);
assert(field.getRegularSubfields('z').length === 0);
assert(field.getRegularSubfields('1', /[BCZ]/).length === 0);

/*
 * MarcDataField.getRegularSubfield()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
assert(field.getRegularSubfield().data === 'AAA');
assert(field.getRegularSubfield(null, /^BBB/).data === 'BBB');
assert(field.getRegularSubfield(null, /[CZ]/).data === 'CCC');
assert(field.getRegularSubfield(null, /^(BBB|CCC|ZZZ)$/).data === 'BBB');
assert(field.getRegularSubfield(null, 'BBB').data === 'BBB');
assert(field.getRegularSubfield('b', /^[BC]/).data === 'BBB');
assert(field.getRegularSubfield(['b', 'c'], /^[C]/).data === 'CCC');
assert(field.getRegularSubfield('c', 'CCC').data === 'CCC');
assert(field.getRegularSubfield('z') === null);
assert(field.getRegularSubfield('1', /[BCZ]/) === null);

/*
 * MarcDataField.getRegularSubfieldData()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
assert(field.getRegularSubfieldData() === 'AAA');
assert(field.getRegularSubfieldData(null, /^BBB/) === 'BBB');
assert(field.getRegularSubfieldData(null, /[CZ]/) === 'CCC');
assert(field.getRegularSubfieldData(null, /^(BBB|CCC|ZZZ)$/) === 'BBB');
assert(field.getRegularSubfieldData(null, 'BBB') === 'BBB');
assert(field.getRegularSubfieldData('b', /^[BC]/) === 'BBB');
assert(field.getRegularSubfieldData(['b', 'c'], /^[C]/) === 'CCC');
assert(field.getRegularSubfieldData('c', 'CCC') === 'CCC');
assert(field.getRegularSubfieldData('z') === null);
assert(field.getRegularSubfieldData('1', /[BCZ]/) === null);

/*
 * MarcDataField.findSubfields()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
assert(field.findSubfields(new MarcSubfield('b', 'BBB')).length === 1);
assert(field.findSubfields(new MarcSubfield('c', 'BBB')).length === 0);
assert(field.findSubfields(new MarcSubfield('c', 'ccc'),
  {ignoreCase: true}).length === 1);
assert(field.findSubfields(new MarcSubfield('c', 'cAcAc'),
  {ignoreCase: true, ignoreChars: /[A]/g}).length === 1);

/*
 * MarcDataField.findSubfield()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
assert(field.findSubfield(new MarcSubfield('b', 'BBB')).data === 'BBB');
assert(field.findSubfield(new MarcSubfield('c', 'BBB')) === null);
assert(field.findSubfield(new MarcSubfield('c', 'ccc'),
  {ignoreCase: true}).data === 'CCC');
assert(field.findSubfield(new MarcSubfield('c', 'cAcAc'),
  {ignoreCase: true, ignoreChars: /[A]/g}).data === 'CCC');

/*
 * MarcDataField.addSubfields()
 */
var field = new MarcDataField('111', '2', '3');
field.addSubfields([new MarcSubfield('a', 'AAA'), new MarcSubfield('b', 'BBB')]);
assert(field.subfields.length === 2 && field.subfields[0].data === 'AAA'
  && field.subfields[1].data === 'BBB');
field.addSubfields(1,
  [new MarcSubfield('c', 'CCC'), new MarcSubfield('d', 'DDD')]);
assert(field.subfields.length === 4 && field.subfields[1].data === 'CCC'
  && field.subfields[2].data === 'DDD');

/*
 * MarcDataField.addSubfield()
 */
var field = new MarcDataField('111', '2', '3');
field.addSubfield(new MarcSubfield('a', 'AAA'));
assert(field.subfields.length === 1 && field.subfields[0].data === 'AAA');
field.addSubfield(new MarcSubfield('b', 'BBB'));
assert(field.subfields.length === 2 && field.subfields[1].data === 'BBB');
field.addSubfield(0, new MarcSubfield('c', 'CCC'));
assert(field.subfields.length === 3 && field.subfields[0].data === 'CCC');

/*
 * MarcDataField.addNonEmptySubfield()
 */
var field = new MarcDataField('111', '2', '3');
field.addNonEmptySubfield(new MarcSubfield('a', 'AAA'));
assert(field.subfields.length === 1 && field.subfields[0].data === 'AAA');
field.addNonEmptySubfield(new MarcSubfield('b', ''));
assert(field.subfields.length === 1);
field.addNonEmptySubfield(new MarcSubfield('c', null));
assert(field.subfields.length === 1);

/*
 * MarcDataField.removeSubfields()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
field.removeSubfields(field.getSubfields(['a', 'c']));
assert(field.subfields.length === 1
  && field.getSubfields(['a', 'c']).length === 0);

var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
field.removeSubfields([1]);
assert(field.subfields.length === 2 && field.getSubfield('b') === null);

var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
field.removeSubfields(field.getSubfields('b'));
assert(field.subfields.length === 2 && field.getSubfield('b') === null);

var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
field.removeSubfields(field.getSubfields('1'));
assert(field.subfields.length === 0);

/*
 * MarcDataField.removeSubfield()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
field.removeSubfield(field.getSubfield('a'));
assert(field.subfields.length === 2 && field.getSubfield('a') === null);

var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
field.removeSubfield(1);
assert(field.subfields.length === 2 && field.getSubfield('b') === null);

var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
field.removeSubfields(field.getSubfields('b'));
assert(field.subfields.length === 2 && field.getSubfield('b') === null);

var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
field.removeSubfields(field.getSubfields('1'));
assert(field.subfields.length === 0);

/*
 * MarcDataField.getVariableFields()
 */
var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
assert(field.getVariableFields().length === 2);
assert(field.getVariableFields('001').length === 1);
assert(field.getVariableFields(/1../).length === 1);
assert(field.getVariableFields(['001', '100']).length === 2);
assert(field.getVariableFields(['001', /1../]).length === 2);
assert(field.getVariableFields('005').length === 0);

/*
 * MarcDataField.getVariableField()
 */
var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
assert(field.getVariableField().tag === '001');
assert(field.getVariableField('001').tag === '001');
assert(field.getVariableField(/1../).tag === '100');
assert(field.getVariableField(['001', '100']).tag === '001');
assert(field.getVariableField(['001', /1../]).tag === '001');
assert(field.getVariableField('005') === null);

/*
 * MarcDataField.getControlFieldData()
 */
var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
assert(field.getControlFieldData('001') === 'ID2');
assert(field.getControlFieldData(/0../) === 'ID2');
assert(field.getControlFieldData(['005', /0../]) === 'ID2');
assert(field.getControlFieldData('005') === null);

/*
 * MarcDataField.getControlNumberField()
 */
var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
assert(field.getControlNumberField().data === 'ID2');
var field = MarcVariableField.parse('444 56$110023$xXXX$yYYY');
assert(field.getControlNumberField() === null);

/*
 * MarcDataField.getControlNumber()
 */
var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
assert(field.getControlNumber() === 'ID2');
var field = MarcVariableField.parse('444 56$110023$xXXX$yYYY');
assert(field.getControlNumber() === null);

/*
 * MarcDataField.addVariableField()
 */
var field = new MarcDataField('111', '2', '3');
field.addVariableField(new MarcControlField('001', 'ID2'));
assert(field.subfields.length === 1 && field.subfields[0].data.tag === '001');
field.addVariableField(0, new MarcDataField('100', '2', '3'));
assert(field.subfields.length === 2 && field.subfields[0].data.tag === '100');

/*
 * MarcDataField.removeVariableFields()
 */
var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
field.removeVariableFields(field.getVariableFields('100'));
assert(field.subfields.length === 1 && field.getVariableField('100') === null);

var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
field.removeVariableFields([0]);
assert(field.subfields.length === 1 && field.getVariableField('001') === null);

/*
 * MarcDataField.removeVariableField()
 */
var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
field.removeVariableField(field.getVariableField('100'));
assert(field.subfields.length === 1 && field.getVariableField('100') === null);

var field = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
field.removeVariableField(0);
assert(field.subfields.length === 1 && field.getVariableField('001') === null);

/*
 * MarcDataField.sort()
 */
var field = MarcVariableField.parse('111 23$cCCC$aAAA$bBBB');
field.sort();
assert(field.subfields[0].code === 'a' && field.subfields[1].code === 'b');

/*
 * MarcDataField.walk()
 */
var field1 = MarcVariableField.parse('111 23$aAAA$bBBB');
var field2 = MarcVariableField.parse('111 23$aAAA$b***');
field1.walk(function (item) {
  if (typeof(item.data) === 'string') {
    item.data = item.data.replace(/[B]/g, '*');
  }
});
assert(field1.equals(field2));

var field1 = MarcVariableField.parse('444 56$1001ID2$110023$xXXX$yYYY');
var field2 = MarcVariableField.parse('444 56$1001ID*$110023$x***$yYYY');
field1.walk(function (item) {
  if (typeof(item.data) === 'string') {
    item.data = item.data.replace(/[2X]/g, '*');
  }
});
assert(field1.equals(field2));

/*
 * MarcDataField.toString()
 */
var field = MarcVariableField.parse('111 23$aAAA$bBBB$cCCC');
assert(field.toString() === '111 23$aAAA$bBBB$cCCC');

/*
 * MarcSubfield constructor.
 */
var subfield = new MarcSubfield();
assert(subfield.code === '?' && subfield.data === '');

var subfield = new MarcSubfield('a', 'AAA');
assert(subfield.code === 'a' && subfield.data === 'AAA');

var subfield1 = new MarcSubfield('a', 'AAA');
var subfield2 = new MarcSubfield(subfield1);
assert(subfield1 !== subfield2 && subfield1.equals(subfield2));

var subfield1 = MarcSubfield.parse('$1001ID2');
var subfield2 = new MarcSubfield(subfield1);
assert(subfield2.data.isControlField());

/*
 * MarcSubfield.parse()
 * MarcSubfield.parseJson()
 * MarcSubfield.parseText()
 */
var subfield = new MarcSubfield('a', 'AAA');
var textSubfield = '$aAAA';
assert(subfield.equals(MarcSubfield.parse(subfield)));
assert(subfield.equals(MarcSubfield.parse(JSON.stringify(subfield))));
assert(subfield.equals(MarcSubfield.parse(textSubfield)));
assert(subfield.equals(MarcSubfield.parseJson(subfield)));
assert(subfield.equals(MarcSubfield.parseText(textSubfield)));

var subfield = new MarcSubfield('1', new MarcControlField('001', 'ID2'));
var textSubfield = '$1001ID2';
assert(subfield.equals(MarcSubfield.parse(subfield)));
assert(subfield.equals(MarcSubfield.parse(JSON.stringify(subfield))));
assert(subfield.equals(MarcSubfield.parse(textSubfield)));
assert(subfield.equals(MarcSubfield.parseJson(subfield)));
assert(subfield.equals(MarcSubfield.parseText(textSubfield)));

var subfield = new MarcSubfield('1', new MarcDataField('100', '2', '3', [
  new MarcSubfield('x', 'XXX'),
  new MarcSubfield('y', 'YYY')
]));
var textSubfield = '$110023$xXXX$yYYY';
assert(subfield.equals(MarcSubfield.parse(subfield)));
assert(subfield.equals(MarcSubfield.parse(JSON.stringify(subfield))));
assert(subfield.equals(MarcSubfield.parse(textSubfield)));
assert(subfield.equals(MarcSubfield.parseJson(subfield)));
assert(subfield.equals(MarcSubfield.parseText(textSubfield)));

/*
 * MarcSubfield.clone()
 */
var subfield = new MarcSubfield('a', 'AAA');
var subfieldClone = MarcSubfield.clone(subfield);
assert(subfieldClone !== subfield && subfieldClone.equals(subfield));
var subfieldClone = subfield.clone();
assert(subfieldClone !== subfield && subfieldClone.equals(subfield));

var subfieldClone = MarcSubfield.clone({});
assert(subfieldClone === null);

/*
 * MarcSubfield.assign()
 */
var subfield1 = new MarcSubfield('a', 'AAA');
var subfield2 = new MarcSubfield('a', 'AAA2');
subfield1.assign(subfield2);
assert(subfield1 !== subfield2 && subfield1.equals(subfield2));

/*
 * MarcSubfield.equals()
 */
var subfield1 = new MarcSubfield('a', 'AAA');
var subfield2 = new MarcSubfield('a', 'AAA2');
var subfield3 = new MarcSubfield('a', 'aaa');
var subfield4 = new MarcSubfield('1', new MarcControlField('001', 'ID1'));
var subfield5 = new MarcSubfield('1', new MarcControlField('001', 'id2'));
var subfield6 = MarcSubfield.parse('$110023$xXXX$yYYY');
var subfield7 = MarcSubfield.parse('$110023$yYYY$xXXX');

assert(subfield1.equals(subfield1));
assert(!subfield1.equals(subfield2));
assert(subfield1.equals(subfield2, {ignoreChars: /[0-9]/g}));
assert(!subfield1.equals(subfield3));
assert(subfield1.equals(subfield3, {ignoreCase: true}));
assert(!subfield4.equals(subfield5));
assert(subfield4.equals(subfield5, {ignoreCase: true, ignoreChars: /[0-9]/g}));
assert(!subfield6.equals(subfield7));
assert(subfield6.equals(subfield7, {ignoreOrder: true}));

/*
 * MarcSubfield.empty()
 */
assert(MarcSubfield.parse('$a').empty());
assert(!MarcSubfield.parse('$aAAA').empty());
assert(!MarcSubfield.parse('$1001ID1').empty());
assert(!MarcSubfield.parse('$110023$xXXX$yYYY').empty());

/*
 * MarcSubfield.isEmbeddedField()
 */
assert(!MarcSubfield.parse('$aAAA').isEmbeddedField());
assert(MarcSubfield.parse('$1001ID1').isEmbeddedField());
assert(MarcSubfield.parse('$110023$xXXX$yYYY').isEmbeddedField());

/*
 * MarcSubfield.getCode()
 */
var subfield = MarcSubfield.parse('$aAAA');
assert(subfield.getCode() === 'a');

/*
 * MarcSubfield.setCode()
 */
var subfield = new MarcSubfield();
subfield.setCode('b');
assert(subfield.code === 'b');

/*
 * MarcSubfield.getData()
 */
var subfield = MarcSubfield.parse('$aAAA');
assert(subfield.getData() === 'AAA');
var subfield = MarcSubfield.parse('$110023$xXXX$yYYY');
assert(subfield.getData().isDataField());

/*
 * MarcSubfield.setData()
 */
var subfield = new MarcSubfield('b');
subfield.setData('text');
assert(subfield.data === 'text');

/*
 * MarcSubfield.toString()
 */
var subfield = MarcSubfield('a', 'AAA');
assert(subfield.toString() === '$aAAA');
var subfield = MarcSubfield('1', MarcControlField('001', 'ID1'));
assert(subfield.toString() === '$1001ID1');
var subfield = MarcSubfield.parse('$110023$xXXX$yYYY');
assert(subfield.toString() === '$110023$xXXX$yYYY');

console.error('OK');
