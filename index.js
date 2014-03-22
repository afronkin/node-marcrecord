var record = require('./lib/record');
var field = require('./lib/field');
var isoreader = require('./lib/isoreader');
var jsonreader = require('./lib/jsonreader');

var exports = module.exports = {};
exports.MarcRecord = record.MarcRecord;
exports.MarcVariableField = field.MarcVariableField;
exports.MarcControlField = field.MarcControlField;
exports.MarcDataField = field.MarcDataField;
exports.MarcSubfield = field.MarcSubfield;
exports.MarcIsoReader = isoreader.MarcIsoReader;
exports.MarcJsonReader = jsonreader.MarcJsonReader;
exports.parse = jsonreader.parseRecord;
