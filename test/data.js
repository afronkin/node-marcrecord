var exports = module.exports = {};

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var MarcRecord = marcrecord.MarcRecord;
var MarcControlField = marcrecord.MarcControlField;
var MarcDataField = marcrecord.MarcDataField;
var MarcSubfield = marcrecord.MarcSubfield;

exports.records = [
  new MarcRecord([
    new MarcControlField('001', 'ID/1'),
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
    ])
  ]),
  new MarcRecord([
    new MarcControlField('001', 'ID/2'),
    new MarcDataField('100', ' ', ' ', [
     new MarcSubfield('a', 'A'),
       new MarcSubfield('b', 'B')
    ])
  ])
];
