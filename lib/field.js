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
 * Always returns false (stub).
 */
MarcVariableField.prototype.isControlField = function() {
  return false;
}

/*
 * Always returns false (stub).
 */
MarcVariableField.prototype.isDataField = function() {
  return false;
}

/*
 * Returns true if the fields are equal.
 */
MarcVariableField.equals = function(field1, field2, weakMode) {
  if (field1 instanceof MarcControlField) {
    return MarcControlField.equals(field1, field2, weakMode);
  } else {
    return MarcDataField.equals(field1, field2, weakMode);
  }
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
 * Parses field from the JSON object.
 */
MarcVariableField.parse = function(jsonField) {
  if (!(jsonField instanceof Object) || typeof(jsonField.tag) !== 'string') {
    throw new Error('invalid field');
  }

  if (jsonField.hasOwnProperty('data')) {
    return new MarcControlField(jsonField.tag, jsonField.data);
  }

  var field = new MarcDataField(jsonField.tag, jsonField.ind1, jsonField.ind2);
  for (var i = 0; i < jsonField.subfields.length; i++) {
    field.subfields.push(MarcSubfield.parse(jsonField.subfields[i]));
  }
  return field;
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
 * Always returns true.
 */
MarcControlField.prototype.isControlField = function() {
  return true;
}

/*
 * Returns true if the fields are equal.
 */
MarcControlField.equals = function(field1, field2, weakMode) {
  if (!(field1 instanceof MarcControlField)
    || !(field2 instanceof MarcControlField))
  {
    return false;
  }
  if (field1.tag !== field2.tag || field1.data !== field2.data) {
    return false;
  }
  return true;
}

/*
 * Returns true if the fields are equal.
 */
MarcControlField.prototype.equals = function(field, weakMode) {
  return MarcControlField.equals(this, field, weakMode);
}

/*
 * Returns true if the field does not contains data.
 */
MarcControlField.prototype.empty = function() {
  return (!this.data);
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
 * Always returns true.
 */
MarcDataField.prototype.isDataField = function() {
  return true;
}

/*
 * Returns true if the fields are equal.
 */
MarcDataField.equals = function(field1, field2, weakMode) {
  if (field1 instanceof MarcDataField && field2 instanceof MarcDataField) {
    if (field1.tag !== field2.tag
      || field1.ind1 !== field2.ind1 || field1.ind2 !== field2.ind2)
    {
      return false;
    }
  }

  if (field1 instanceof MarcDataField) {
    var subfields1 = field1.subfields;
  } else if (field1 instanceof Array) {
    var subfields1 = field1;
  } else {
    return false;
  }

  if (field2 instanceof MarcDataField) {
    var subfields2 = weakMode !== true ?
      field2.subfields : field2.subfields.slice();
  } else if (field2 instanceof Array) {
    var subfields2 = weakMode !== true ? field2 : field2.slice();
  } else {
    return false;
  }

  if (subfields1.length !== subfields2.length) {
    return false;
  }

  if (weakMode !== true) {
    for (var i = 0; i < subfields1.length; i++) {
      if (!subfields1[i].equals(subfields2[i])) {
        return false;
      }
    }
  } else {
    for (var i = 0; i < subfields1.length; i++) {
      for (var j = 0; j < subfields2.length; j++) {
        if (subfields1[i].equals(subfields2[j], true)) {
          break;
        }
      }
      if (j === subfields2.length) {
        return false;
      }
      subfields2.splice(j, 1);
    }
  }

  return true;
}

/*
 * Returns true if the fields are equal.
 */
MarcDataField.prototype.equals = function(field, weakMode) {
  return MarcDataField.equals(this, field, weakMode);
}

/*
 * Returns number of subfields in the field.
 */
MarcDataField.prototype.size = function() {
  return this.subfields.length;
}

/*
 * Returns true if the field does not contains subfields.
 */
MarcDataField.prototype.empty = function() {
  return (this.subfields.length === 0);
}

/*
 * Removes subfields not containing actual data.
 */
MarcDataField.prototype.trim = function() {
  for (var subfieldNo = this.subfields.length - 1; subfieldNo >= 0;
    subfieldNo--)
  {
    var subfield = this.subfields[subfieldNo];
    if (subfield.data instanceof MarcDataField) {
      subfield.data.trim();
    }
    if (subfield.empty()) {
      this.subfields.splice(subfieldNo, 1);
    }
  }
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
    return this.subfields.slice();
  }

  var codeList = codes instanceof Array ? codes : [codes];
  var subfields = [];
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

  var codeList = codes instanceof Array ? codes : [codes];
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
    return this.subfields.length > 0 ? this.subfields[0].data : null;
  }

  var codeList = codes instanceof Array ? codes : [codes];
  for (var i = 0; i < this.subfields.length; i++) {
    var subfield = this.subfields[i];
    if (codeList.indexOf(subfield.code) >= 0) {
      return subfield.data;
    }
  }
  return null;
}

/*
 * Returns the list of regular subfields for the given subfield codes
 * and data pattern.
 */
MarcDataField.prototype.getRegularSubfields = function(codes, pattern) {
  var codeList = !codes ? null : (codes instanceof Array ? codes : [codes]);
  var subfields = [];
  for (var i = 0; i < this.subfields.length; i++) {
    var subfield = this.subfields[i];
    if (!(subfield.data instanceof MarcVariableField)
      && (!codeList || codeList.indexOf(subfield.code) >= 0)
      && (!pattern || pattern.test(subfield.data)))
    {
      subfields.push(subfield);
    }
  }
  return subfields;
}

/*
 * Returns the first regular subfield for the given subfield codes
 * and data pattern.
 */
MarcDataField.prototype.getRegularSubfield = function(codes, pattern) {
  var codeList = !codes ? null : (codes instanceof Array ? codes : [codes]);
  var subfields = [];
  for (var i = 0; i < this.subfields.length; i++) {
    var subfield = this.subfields[i];
    if (!(subfield.data instanceof MarcVariableField)
      && (!codeList || codeList.indexOf(subfield.code) >= 0)
      && (!pattern || pattern.test(subfield.data)))
    {
      return subfield;
    }
  }
  return null;
}

/*
 * Returns the data of first regular subfield for the given subfield codes
 * and data pattern.
 */
MarcDataField.prototype.getRegularSubfieldData = function(codes, pattern) {
  var codeList = !codes ? null : (codes instanceof Array ? codes : [codes]);
  var subfields = [];
  for (var i = 0; i < this.subfields.length; i++) {
    var subfield = this.subfields[i];
    if (!(subfield.data instanceof MarcVariableField)
      && (!codeList || codeList.indexOf(subfield.code) >= 0)
      && (!pattern || pattern.test(subfield.data)))
    {
      return subfield.data;
    }
  }
  return null;
}

/*
 * Returns a list of embedded variable fields.
 */
MarcDataField.prototype.getVariableFields = function(tags) {
  var tagList = !tags ? null : (tags instanceof Array ? tags : [tags]);
  var fields = [];
  for (var subfieldNo = 0; subfieldNo < this.subfields.length; subfieldNo++) {
    var subfield = this.subfields[subfieldNo];
    if (!(subfield.data instanceof MarcVariableField)) {
      continue;
    }
    if (!tagList) {
      fields.push(subfield.data);
      continue;
    }
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(subfield.data.tag)
        || tag === subfield.data.tag)
      {
        fields.push(subfield.data);
        break;
      }
    }
  }
  return fields;
}

/*
 * Returns an embedded variable field.
 */
MarcDataField.prototype.getVariableField = function(tags) {
  var tagList = !tags ? null : (tags instanceof Array ? tags : [tags]);
  for (var subfieldNo = 0; subfieldNo < this.subfields.length; subfieldNo++) {
    var subfield = this.subfields[subfieldNo];
    if (!(subfield.data instanceof MarcVariableField)) {
      continue;
    }
    if (!tagList) {
      return subfield.data;
    }
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(subfield.data.tag)
        || tag === subfield.data.tag)
      {
        return subfield.data;
      }
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
 * Removes a list of subfields.
 */
MarcDataField.prototype.removeSubfields = function(subfields) {
  for (var i = 0; i < subfields.length; i++) {
    this.removeSubfield(subfields[i]);
  }
}

/*
 * Removes a subfield.
 */
MarcDataField.prototype.removeSubfield = function(subfield) {
  if (!(subfield instanceof MarcSubfield)) {
    var index = Number(subfield);
    if (isNaN(index) || index < 0 || index >= this.subfields.length) {
      throw new Error('invalid subfield specified: '
        + JSON.stringify(subfield));
    }
    this.subfields.splice(index, 1);
    return;
  }

  for (;;) {
    var index = this.subfields.indexOf(subfield);
    if (index < 0) {
      break;
    }
    this.subfields.splice(index, 1);
  }
}

/*
 * Returns data of the first embedded control field, found by field tag.
 */
MarcDataField.prototype.getControlFieldData = function(tags) {
  var field = this.getVariableField(tags);
  if (!(field && field instanceof MarcControlField)) {
    return null;
  }
  return field.data;
}

/*
 * Returns the control number embedded field or null if no control.
 */
MarcDataField.prototype.getControlNumberField = function() {
  var field = this.getVariableField('001');
  if (!(field && field instanceof MarcControlField)) {
    return null;
  }
  return field;
}

/*
 * Returns the control number from embedded control field
 * or null if no control number is available.
 */
MarcDataField.prototype.getControlNumber = function() {
  return this.getControlFieldData('001');
}

/*
 * Adds an embedded variable field.
 */
MarcDataField.prototype.addVariableField = function(index, field) {
  if (index instanceof MarcVariableField) {
    this.subfields.push(new MarcSubfield('1', index));
  } else if (field instanceof MarcVariableField) {
    this.subfields.splice(index, 0, new MarcSubfield('1', field));
  } else {
    throw new Error('invalid type of embedded field');
  }
}

/*
 * Removes a list of embedded variable fields.
 */
MarcDataField.prototype.removeVariableFields = function(variableFields) {
  for (var i = 0; i < variableFields.length; i++) {
    this.removeVariableField(variableFields[i]);
  }
}

/*
 * Removes an embedded variable field.
 */
MarcDataField.prototype.removeVariableField = function(variableField) {
  var index = null;
  if (!(variableField instanceof MarcVariableField)) {
    index = Number(variableField);
    if (isNaN(index) || index < 0) {
      throw new Error('invalid field specified: '
        + JSON.stringify(variableField));
    }
  }

  var embeddedFieldNo = 0;
  for (var subfieldNo = 0; subfieldNo < this.subfields.length; subfieldNo++) {
    var subfield = this.subfields[subfieldNo];
    if (!(subfield.data instanceof MarcVariableField)) {
      continue;
    }

    if ((index === null && subfield.data === variableField)
      || embeddedFieldNo === index)
    {
      this.subfields.splice(subfieldNo, 1);
    }

    embeddedFieldNo++;
  }
}

/*
 * Reorders subfields according to its codes.
 */
MarcDataField.prototype.sort = function() {
  var indexes = {};
  for (var i = 0; i < this.subfields.length; i++) {
    indexes[this.subfields[i]] = i;
  }

  this.subfields.sort(function(a, b) {
    // If both subfields are embedded fields, we compare tags.
    if (a.code === b.code
      && a.data instanceof MarcVariableField
      && b.data instanceof MarcVariableField)
    {
      // We don't want to reorder embedded fields with the same tags.
      if (a.data.tag === b.data.tag) {
        return indexes[a] - indexes[b];
      }
      return a.data.tag < b.data.tag ? -1 : 1;
    }

    // We don't want to reorder subfields with the same codes.
    if (a.code === b.code) {
      return indexes[a] - indexes[b];
    }

    // Compare codes only if they are both numerical or non numerical.
    var aCodeIsNumber = !isNaN(parseInt(a.code));
    var bCodeIsNumber = !isNaN(parseInt(b.code));
    if (aCodeIsNumber === bCodeIsNumber) {
      return a.code < b.code ? -1 : 1;
    }

    // Sort numerical codes after alphabetical.
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
MarcSubfield.equals = function(subfield1, subfield2, weakMode) {
  if (!(subfield1 instanceof MarcSubfield)
    || !(subfield2 instanceof MarcSubfield))
  {
    return false;
  }
  if (subfield1.code !== subfield2.code) {
    return false;
  }
  if (subfield1.data instanceof MarcVariableField) {
    return subfield1.data.equals(subfield2.data, weakMode);
  }
  return subfield1.data === subfield2.data;
}

/*
 * Returns true if the subfields are equal.
 */
MarcSubfield.prototype.equals = function(subfield, weakMode) {
  return MarcSubfield.equals(this, subfield, weakMode);
}

/*
 * Returns true if the subfield does not contains data.
 */
MarcSubfield.prototype.empty = function() {
  if (this.data instanceof MarcVariableField) {
    return this.data.empty();
  }
  return (!this.data);
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
 * Parses subfield from the JSON object.
 */
MarcSubfield.parse = function(jsonSubfield) {
  if (!(jsonSubfield instanceof Object)
    || (typeof(jsonSubfield.code) !== 'string'
      && typeof(jsonSubfield.code) !== 'c')
    || (typeof(jsonSubfield.data) !== 'string'
      && !(jsonSubfield.data instanceof Object)))
  {
    throw new Error('invalid subfield');
  }

  if (jsonSubfield.data instanceof Object) {
    return new MarcSubfield(
      jsonSubfield.code, MarcVariableField.parse(jsonSubfield.data));
  }

  return new MarcSubfield(jsonSubfield.code, jsonSubfield.data);
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
    textSubfield += ' ' + this.data.toString();
  }
  return textSubfield;
}

module.exports = {
  MarcVariableField: MarcVariableField,
  MarcControlField: MarcControlField,
  MarcDataField: MarcDataField,
  MarcSubfield: MarcSubfield
};
