var exports = module.exports = {};
exports.MarcVariableField = MarcVariableField;
exports.MarcControlField = MarcControlField;
exports.MarcDataField = MarcDataField;
exports.MarcSubfield = MarcSubfield;

/*
 * The constructor of MARC variable field (base field class).
 */
function MarcVariableField(tag) {
  if (!(this instanceof MarcVariableField)) {
    return new MarcVariableField(tag);
  }

  this.tag = tag || '???';
}

/*
 * Returns 'true' if the fields are equal.
 */
MarcVariableField.prototype.equals = function(field) {
  return this.equals(field);
}

/*
 * Returns 'true' if field is control field.
 */
MarcVariableField.prototype.isControlField = function() {
  return this instanceof MarcControlField;
}

/*
 * Returns 'true' if field is data field.
 */
MarcVariableField.prototype.isDataField = function() {
  return this instanceof MarcDataField;
}

/*
 * The constructor of MARC control field (subclass of the variable field).
 */
function MarcControlField(tag, data) {
  if (!(this instanceof MarcControlField)) {
    return new MarcControlField(tag, data);
  }

  if (tag instanceof MarcControlField) {
    // Copy the source field.
    var srcField = tag;
    this.tag = srcField.tag;
    this.data = srcField.data;
  } else {
    // Initialize field.
    MarcVariableField.call(this, tag);
    this.data = data || '???';
  }
}

MarcControlField.prototype = new MarcVariableField;

/*
 * Returns 'true' if the fields are equal.
 */
MarcControlField.prototype.equals = function(field) {
  if (!(field instanceof MarcControlField)) {
    return false;
  }
  if (this.tag !== field.tag || this.data !== field.data) {
    return false;
  }
  return true;
}

/*
 * Converts control field to string representation.
 */
MarcControlField.prototype.toString = function() {
  if (this.data.length == 0) {
    return this.tag;
  } else {
    return this.tag + ' ' + this.data;
  }
}

/*
 * The constructor of MARC data field (subclass of the variable field).
 */
function MarcDataField(tag, ind1, ind2) {
  if (!(this instanceof MarcDataField)) {
    return new MarcDataField(tag, ind1, ind2);
  }

  if (tag instanceof MarcDataField) {
    // Copy the source field.
    var srcField = tag;
    this.tag = srcField.tag;
    this.ind1 = srcField.ind1;
    this.ind2 = srcField.ind2;
    this.subfields = [];

    for (var i = 0; i < srcField.subfields.length; i++) {
      this.addSubfield(new MarcSubfield(srcField.subfields[i]));
    }
  } else {
    // Initialize field.
    MarcVariableField.call(this, tag);
    this.ind1 = ind1 || ' ';
    this.ind2 = ind2 || ' ';
    this.subfields = [];
  }
}

MarcDataField.prototype = new MarcVariableField;

/*
 * Returns 'true' if the fields are equal.
 */
MarcDataField.prototype.equals = function(field) {
  if (!(field instanceof MarcDataField)) {
    return false;
  }
  if (this.tag !== field.tag
    || this.ind1 !== field.ind1 || this.ind2 !== field.ind2
    || this.subfields.length !== field.subfields.length)
  {
    return false;
  }

  for (var i = 0; i < this.subfields.length; i++) {
    if (!this.subfields[i].equals(field.subfields[i])) {
      return false;
    }
  }

  return true;
}

/*
 * Adds subfield to the field.
 */
MarcDataField.prototype.addSubfield = function(subfield) {
  if (!(subfield instanceof MarcSubfield)) {
    throw new Error('Wrong argument type');
  }
  this.subfields.push(subfield);
}

/*
 * Returns number of subfields in the field.
 */
MarcDataField.prototype.size = function() {
  return this.subfields.length;
}

/*
 * Converts data field to string representation.
 */
MarcDataField.prototype.toString = function() {
  var textField = this.tag + ' [' + this.ind1 + this.ind2 + ']';
  for (var subfieldNo in this.subfields) {
    var subfield = this.subfields[subfieldNo];
    textField += ' ' + subfield.toString();
  }
  return textField;
}

/*
 * The constructor of MARC subfield.
 */
function MarcSubfield(code, data) {
  if (!(this instanceof MarcSubfield)) {
    return new MarcSubfield(code, data);
  }

  if (code instanceof MarcSubfield) {
    // Copy the source subfield.
    var srcSubfield = code;
    this.code = srcSubfield.code;

    if (srcSubfield.data instanceof MarcControlField) {
      this.data = new MarcControlField(srcSubfield.data);
    } else if (srcSubfield.data instanceof MarcDataField) {
      this.data = new MarcDataField(srcSubfield.data);
    } else {
      this.data = srcSubfield.data;
    }
  } else {
    // Initialize subfield.
    this.code = code || '?';
    this.data = data || null;
  }
}

/*
 * Returns 'true' if the subfields are equal.
 */
MarcSubfield.prototype.equals = function(subfield) {
  if (!(subfield instanceof MarcSubfield)) {
    return false;
  }
  if (this.code !== subfield.code) {
    return false;
  }
  if (this.data instanceof MarcVariableField) {
    return this.data.equals(subfield.data);
  }
  return this.data === subfield.data;
}

/*
 * Returns 'true' if subfield is embedded field.
 */
MarcSubfield.prototype.isEmbeddedField = function() {
  return this.data instanceof MarcVariableField;
}

/*
 * Converts subfield to string representation.
 */
MarcSubfield.prototype.toString = function() {
  var textSubfield = '$' + this.code;
  if (!(this.data instanceof MarcVariableField)) {
    if (this.data.length > 0) {
      textSubfield += ' ' + this.data;
    }
  } else if (this.data !== null) {
    textSubfield += ' <' + this.data.toString() + '>';
  }
  return textSubfield;
}
