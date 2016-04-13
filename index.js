var record = require('./lib/record');
var field = require('./lib/field');
var isoreader = require('./lib/isoreader');
var isowriter = require('./lib/isowriter');
var jsonreader = require('./lib/jsonreader');
var xmlwriter = require('./lib/xmlwriter');

var MarcJsonReader = jsonreader.MarcJsonReader;

module.exports = {
  MarcRecord: record.MarcRecord,
  MarcVariableField: field.MarcVariableField,
  MarcControlField: field.MarcControlField,
  MarcDataField: field.MarcDataField,
  MarcSubfield: field.MarcSubfield,
  MarcIsoReader: isoreader.MarcIsoReader,
  MarcIsoWriter: isowriter.MarcIsoWriter,
  MarcJsonReader: jsonreader.MarcJsonReader,
  MarcXmlWriter: xmlwriter.MarcXmlWriter,

  parse: MarcJsonReader.parseRecord,
  parseRecord: MarcJsonReader.parseRecord,
  parseField: MarcJsonReader.parseField,
  parseSubfield: MarcJsonReader.parseSubfield
};
