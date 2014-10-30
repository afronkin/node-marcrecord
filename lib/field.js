var exports = module.exports = {};
exports.MarcVariableField = MarcVariableField;
exports.MarcControlField = MarcControlField;
exports.MarcDataField = MarcDataField;
exports.MarcSubfield = MarcSubfield;

/*
 * Represents a variable field in a MARC record.
 */
function MarcVariableField(tag) {
  if (!(this instanceof MarcVariableField)) {
    return new MarcVariableField(tag);
  }

  this.tag = tag || '???';
}

/*
 * Returns true if the fields are equal.
 */
MarcVariableField.prototype.equals = function(field) {
  return this.equals(field);
}

/*
 * Returns true if field is control field.
 */
MarcVariableField.prototype.isControlField = function() {
  return this instanceof MarcControlField;
}

/*
 * Returns true if field is data field.
 */
MarcVariableField.prototype.isDataField = function() {
  return this instanceof MarcDataField;
}

/*
 * Returns the tag name.
 */
MarcVariableField.prototype.getTag = function() {
  return this.tag;
}

/*
 * Sets the tag name.
 */
MarcVariableField.prototype.setTag = function(tag) {
  this.tag = tag;
}

/*
 * Returns true if the given regular expression matches a subsequence of a
 * data element within the variable field.
 */
MarcVariableField.prototype.find = function(pattern) {
  throw new Error('not implemented');
}

/*
 * Represents a control field in a MARC record.
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
    this.data = data || '';
  }
}

MarcControlField.prototype = new MarcVariableField;

/*
 * Returns true if the fields are equal.
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
 * Returns the data element.
 */
MarcControlField.prototype.getData = function() {
  return this.data;
}

/*
 * Sets the data element.
 */
MarcControlField.prototype.setData = function(data) {
  this.data = data;
}

/*
 * Returns a string representation of this control field.
 */
MarcControlField.prototype.toString = function() {
  if (this.data.length == 0) {
    return this.tag;
  } else {
    return this.tag + ' ' + this.data;
  }
}

/*
 * Represents a data field in a MARC record.
 */
function MarcDataField(tag, ind1, ind2, subfields) {
  if (!(this instanceof MarcDataField)) {
    return new MarcDataField(tag, ind1, ind2, subfields);
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
    this.subfields = subfields || [];
  }
}

MarcDataField.prototype = new MarcVariableField;

/*
 * Returns true if the fields are equal.
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
 * Returns number of subfields in the field.
 */
MarcDataField.prototype.size = function() {
  return this.subfields.length;
}

/*
 * Returns the first indicator.
 */
MarcDataField.prototype.getIndicator1 = function() {
  return this.ind1;
}

/*
 * Sets the first indicator.
 */
MarcDataField.prototype.setIndicator1 = function(ind1) {
  this.ind1 = ind1;
}

/*
 * Returns the second indicator.
 */
MarcDataField.prototype.getIndicator2 = function() {
  return this.ind2;
}

/*
 * Sets the second indicator.
 */
MarcDataField.prototype.setIndicator2 = function(ind2) {
  this.ind2 = ind2;
}

/*
 * Returns the list of subfields for the given subfield codes.
 */
MarcDataField.prototype.getSubfields = function(codes) {
  if (!codes) {
    return this.subfields;
  }

  var codeList = typeof(codes) === 'string' ? [codes] : codes;
  subfields = [];
  for (var i = 0; i < this.subfields.length; i++) {
    var subfield = this.subfields[i];
    if (codeList.indexOf(subfield.code) >= 0) {
      subfields.push(subfield);
    }
  }
  return subfields;
}

/*
 * Returns the first subfield for the given subfield codes.
 */
MarcDataField.prototype.getSubfield = function(codes) {
  if (!codes) {
    return this.subfields.length > 0 ? this.subfields[0] : null;
  }

  var codeList = typeof(codes) === 'string' ? [codes] : codes;
  for (var i = 0; i < this.subfields.length; i++) {
    var subfield = this.subfields[i];
    if (codeList.indexOf(subfield.code) >= 0) {
      return subfield;
    }
  }
  return null;
}

/*
 * Returns the data of first subfield for the given subfield codes.
 */
MarcDataField.prototype.getSubfieldData = function(codes) {
  if (!codes) {
    return this.subfields.length > 0 ? this.subfields[0] : null;
  }

  var codeList = typeof(codes) === 'string' ? [codes] : codes;
  for (var i = 0; i < this.subfields.length; i++) {
    var subfield = this.subfields[i];
    if (codeList.indexOf(subfield.code) >= 0) {
      return subfield.data;
    }
  }
  return null;
}

/*
 * Adds a subfield.
 */
MarcDataField.prototype.addSubfield = function(index, subfield) {
  if (index instanceof MarcSubfield) {
    this.subfields.push(index);
  } else if (subfield instanceof MarcSubfield) {
    this.subfields.splice(index, 0, subfield);
  } else {
    throw new Error('invalid type of subfield');
  }
}

/*
 * Removes a subfield.
 */
MarcDataField.prototype.removeSubfield = function(subfield) {
  var subfieldNo = this.subfields.indexOf(subfield);
  if (subfieldNo >= 0) {
    this.subfields.splice(subfieldNo, 1);
  }
}

/*
 * Reorders subfields according to its codes.
 */
MarcDataField.prototype.sort = function() {
  this.subfields.sort(function(a, b) {
    if (a.code === b.code
      && a.data instanceof MarcVariableField
      && b.data instanceof MarcVariableField)
    {
      return a.data.tag < b.data.tag ? -1 : (a.data.tag > b.data.tag ? 1 : 0);
    }
    var aCodeIsNumber = !isNaN(parseInt(a.code));
    var bCodeIsNumber = !isNaN(parseInt(b.code));
    if (aCodeIsNumber === bCodeIsNumber) {
      return a.code < b.code ? -1 : (a.code > b.code ? 1 : 0);
    }
    return aCodeIsNumber ? 1 : -1;
  });
}

/*
 * Returns a string representation of this data field.
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
 * Represents a subfield in a MARC record.
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
    this.data = data || '';
  }
}

/*
 * Returns true if the subfields are equal.
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
 * Returns true if subfield is embedded field.
 */
MarcSubfield.prototype.isEmbeddedField = function() {
  return this.data instanceof MarcVariableField;
}

/*
 * Returns the data element identifier.
 */
MarcSubfield.prototype.getCode = function() {
  return this.code;
}

/*
 * Sets the data element identifier.
 */
MarcSubfield.prototype.setCode = function(code) {
  this.code = code;
}

/*
 * Returns the data element.
 */
MarcSubfield.prototype.getData = function() {
  return this.data;
}

/*
 * Sets the data element.
 */
MarcSubfield.prototype.setData = function(data) {
  this.data = data;
}

/*
 * Returns true if the given regular expression matches a subsequence of the
 * data element.
 */
MarcSubfield.prototype.find = function(pattern) {
  throw new Error('not implemented');
}

/*
 * Returns a string representation of this subfield.
 */
MarcSubfield.prototype.toString = function() {
  var textSubfield = '$' + this.code;
  if (!(this.data instanceof MarcVariableField)) {
    if (this.data.length > 0) {
      textSubfield += ' ' + this.data;
    }
  } else if (this.data) {
    textSubfield += ' <' + this.data.toString() + '>';
  }
  return textSubfield;
}
