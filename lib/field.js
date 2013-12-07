/**
 * Expose constructors.
 */
var exports = module.exports = {};
exports.MarcVariableField = MarcVariableField;
exports.MarcControlField = MarcControlField;
exports.MarcDataField = MarcDataField;
exports.MarcSubfield = MarcSubfield;

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
