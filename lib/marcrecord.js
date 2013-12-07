/**
 * MARC record module.
 */

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

/**
 * The constructor of MARC variable field (base field class).
 */
function MarcVariableField(tag) {
  // Tag of the field.
  this.tag = tag || null;
}

/**
 * Returns 'true' if field is control field.
 */
MarcVariableField.prototype.isControlField = function() {
  return this instanceof MarcControlField;
}

/**
 * Returns 'true' if field is data field.
 */
MarcVariableField.prototype.isDataField = function() {
  return this instanceof MarcDataField;
}

/**
 * The constructor of MARC control field (subclass of the variable field).
 */
function MarcControlField(tag, data) {
  // Call parent constructor.
  MarcVariableField.call(this, tag);
  // Data of the control field.
  this.data = data || null;
}

MarcControlField.prototype = new MarcVariableField;

/**
 * The constructor of MARC data field (subclass of the variable field).
 */
function MarcDataField(tag, ind1, ind2) {
  // Call parent constructor.
  MarcVariableField.call(this, tag);
  // Indicators.
  this.ind1 = ind1 || ' ';
  this.ind2 = ind2 || ' ';
  // List of subfields of the data field. 
  this.subfields = [];
}

MarcDataField.prototype = new MarcVariableField;

/**
 * Adds subfield to the field.
 */
MarcDataField.prototype.addSubfield = function(subfield) {
  if (!(subfield instanceof MarcSubfield)) {
    throw new Error('Wrong argument type');
  }
  this.subfields.push(subfield);
}

/**
 * Returns number of subfields in the field.
 */
MarcDataField.prototype.size = function() {
  return this.subfields.length;
}

/**
 * The constructor of MARC subfield.
 */
function MarcSubfield(code, data) {
  // The code of subfield.
  this.code = code || null;
  // The data of subfield.
  this.data = data || null;
}

/**
 * Returns 'true' if subfield is embedded field.
 */
MarcSubfield.prototype.isEmbeddedField = function() {
  return this.data instanceof MarcVariableField;
}

// Export classes.
var marcrecord = {
  MarcRecord: MarcRecord,
  MarcVariableField: MarcVariableField,
  MarcControlField: MarcControlField,
  MarcDataField: MarcDataField,
  MarcSubfield: MarcSubfield };
module.exports = marcrecord;
