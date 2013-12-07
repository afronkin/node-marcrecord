/**
 * Module dependencies.
 */
var field = require('./field');
var MarcVariableField = field.MarcVariableField,
  MarcControlField = field.MarcControlField,
  MarcDataField = field.MarcDataField,
  MarcSubfield = field.MarcSubfield;

/**
 * Expose constructors.
 */
var exports = module.exports = {};
exports.MarcRecord = MarcRecord;
exports.MarcVariableField = MarcVariableField;
exports.MarcControlField = MarcControlField;
exports.MarcDataField = MarcDataField;
exports.MarcSubfield = MarcSubfield;

/**
 * The constructor of MARC record.
 */
function MarcRecord() {
  // The record leader.
  this.leader = null;
  // List of fields of the record.
  this.fields = [];
}

/**
 * Returns number of fields in the record.
 */
MarcRecord.prototype.size = function() {
  return this.fields.length;
}

/**
 * Parses record data from the ISO2709 buffer.
 */
MarcRecord.prototype.parseIsoBuffer = function(buffer, encoding) {
  // Validate function arguments.
  encoding = encoding || 'utf8';

  // Get the record leader.
  this.leader = buffer.toString(encoding, 0, 24);
}

/**
 * Adds variable field to the record.
 */
MarcRecord.prototype.addVariableField = function(variableField) {
  this.fields.push(variableField);
}

/**
 * Removes variable field from the record.
 */
MarcRecord.prototype.removeVariableField = function(variableField) {
  var fieldNo = this.fields.indexOf(variableField);
  if (fieldNo >= 0) {
    this.fields.splice(fieldNo, 1);
  }
}

/**
 * Returns the first variable field with the given tag.
 */
MarcRecord.prototype.getVariableField = function(tag) {
  for (var fieldNo in this.fields) {
    var field = this.fields[fieldNo];
    if (field.tag === tag) {
      return field;
    }
  }
  return null;
}

/**
 * Returns a list of variable fields with the given tag.
 */
MarcRecord.prototype.getVariableFields = function(tag) {
  var foundFields = [];
  for (var fieldNo in this.fields) {
    var field = this.fields[fieldNo];
    if (field.tag === tag) {
      foundFields.push(field);
    }
  }
  return foundFields;
}
