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
  MarcRecord([
    MarcControlField('001', 'ID/1'),
    MarcDataField('950', '3', '4', [
      MarcSubfield('c', 'C'),
      MarcSubfield('b', 'B'),
      MarcSubfield('1', MarcDataField('905', '5', '6', [
        MarcSubfield('z', 'Z'),
        MarcSubfield('a', 'A')
      ])),
      MarcSubfield('1', MarcControlField('001', '2')),
      MarcSubfield('1', MarcDataField('905', '7', '8', [
        MarcSubfield('q', 'Q'),
        MarcSubfield('g', 'G')
      ])),
    ]),
    MarcDataField('900', '1', '2', [
      MarcSubfield('c', 'C'),
      MarcSubfield('a', 'A'),
      MarcSubfield('b', 'B')
    ]),
    MarcDataField('900', '3', '4', [
      MarcSubfield('z', 'Z'),
      MarcSubfield('x', 'X'),
      MarcSubfield('y', 'Y')
    ])
  ]),
  MarcRecord([
    MarcDataField('100', ' ', ' ', [
      MarcSubfield('b', 'B'),
      MarcSubfield('a', 'A')
    ]),
    MarcControlField('001', 'ID/2')
  ]),
  MarcRecord([
    MarcControlField('001', 'ID/2'),
    MarcDataField('100', ' ', ' ', [
      MarcSubfield('a', 'A'),
      MarcSubfield('b', 'B')
    ])
  ])
];
