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
 * Returns new field created from the source format.
 */
MarcVariableField.parse = function(srcField) {
  if (srcField instanceof Object) {
    return MarcVariableField.parseJson(srcField);
  }
  if (typeof(srcField) === 'string') {
    if (/^[ \t\r\n]*\{/.test(srcField)) {
      return MarcVariableField.parseJson(JSON.parse(srcField));
    }
    return MarcVariableField.parseText(srcField);
  }
  throw new Error('invalid field');
}

/*
 * Returns new field created from the JSON object.
 */
MarcVariableField.parseJson = function(jsonField) {
  if (!(jsonField instanceof Object) || typeof(jsonField.tag) !== 'string') {
    throw new Error('invalid field');
  }

  if (jsonField.hasOwnProperty('data')) {
    return new MarcControlField(jsonField.tag, jsonField.data);
  }

  var field = new MarcDataField(jsonField.tag, jsonField.ind1, jsonField.ind2);
  for (var i = 0; i < jsonField.subfields.length; i++) {
    field.subfields.push(MarcSubfield.parseJson(jsonField.subfields[i]));
  }
  return field;
}

/*
 * Returns new field created from the text string.
 */
MarcVariableField.parseText = function(textField) {
  if (typeof(textField) !== 'string') {
    throw new Error('invalid field');
  }

  var tag = textField.slice(0, 3);
  if (!/^[0-9]{3}$/.test(tag)) {
    throw new Error('invalid field');
  }

  if (tag >= '001' && tag <= '009') {
    return new MarcControlField(tag, textField.slice(4));
  }

  var ind1 = textField.slice(4, 5);
  var ind2 = textField.slice(5, 6);
  if (ind1.length !== 1 || ind2.length !== 1) {
    throw new Error('invalid field');
  }

  var field = new MarcDataField(tag, ind1, ind2);
  var textSubfieldGroups = textField.slice(6).split(/(?=\$1)/ig);
  for (var groupNo = 0; groupNo < textSubfieldGroups.length; groupNo++) {
    var textSubfieldGroup = textSubfieldGroups[groupNo];
    if (textSubfieldGroup.slice(1, 2) === '1') {
      field.subfields.push(MarcSubfield.parseText(textSubfieldGroup));
    } else {
      var textSubfields = textSubfieldGroup.split(/(?=\$[0-9a-z])/ig);
      for (var i = 0; i < textSubfields.length; i++) {
        field.subfields.push(MarcSubfield.parseText(textSubfields[i]));
      }
    }
  }
  return field;
}

/*
 * Returns copy of the specified field.
 */
MarcVariableField.clone = function(field) {
  if (field instanceof MarcControlField) {
    return new MarcControlField(field);
  } else if (field instanceof MarcDataField) {
    return new MarcDataField(field);
  }
  return null;
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
MarcVariableField.equals = function(field1, field2, opts) {
  if (field1 instanceof MarcControlField) {
    return MarcControlField.equals(field1, field2, opts || {});
  } else {
    return MarcDataField.equals(field1, field2, opts || {});
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
 * Returns copy of the specified field.
 */
MarcControlField.clone = function(field) {
  if (field instanceof MarcControlField) {
    return new MarcControlField(field);
  }
  return null;
}

/*
 * Replaces content of the field.
 */
MarcControlField.prototype.assign = function(field) {
  if (!(field instanceof MarcControlField)) {
    return false;
  }
  this.tag = field.tag;
  this.data = field.data;
  return true;
}

/*
 * Returns copy of the field.
 */
MarcControlField.prototype.clone = function() {
  return MarcControlField.clone(this);
}

/*
 * Always returns true.
 */
MarcControlField.prototype.isControlField = function() {
  return true;
}

/*
 * Returns true if the fields are equal.
 */
MarcControlField.equals = function(field1, field2, opts) {
  opts = opts || {};

  if (!(field1 instanceof MarcControlField)
    || !(field2 instanceof MarcControlField))
  {
    return false;
  }
  if (field1.tag !== field2.tag) {
    return false;
  }

  var data1 = field1.data;
  var data2 = field2.data;
  if (opts.ignoreCase) {
    data1 = data1.toUpperCase();
    data2 = data2.toUpperCase();
  }
  if (opts.ignoreChars) {
    data1 = data1.replace(opts.ignoreChars, '');
    data2 = data2.replace(opts.ignoreChars, '');
  }
  return data1 === data2;
}

/*
 * Returns true if the fields are equal.
 */
MarcControlField.prototype.equals = function(field, opts) {
  return MarcControlField.equals(this, field, opts || {});
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
 * Returns copy of the specified field.
 */
MarcDataField.clone = function(field) {
  if (field instanceof MarcDataField) {
    return new MarcDataField(field);
  }
  return null;
}

/*
 * Returns copy of the field.
 */
MarcDataField.prototype.clone = function() {
  return MarcDataField.clone(this);
}

/*
 * Returns copy of the subfields array.
 */
MarcDataField.cloneSubfields = function(subfields, opts) {
  if (!(subfields instanceof Array)) {
    return null;
  }
  opts = opts || {};
  var subfieldsCopy = [];
  for (var i = 0; i < subfields.length; i++) {
    var subfieldCopy = subfields[i].clone();
    if (opts.newCode) {
      subfieldCopy.code = opts.newCode;
    }
    subfieldsCopy.push(subfieldCopy);
  }
  return subfieldsCopy;
}

/*
 * Returns copy of the subfields array.
 */
MarcDataField.prototype.cloneSubfields = function(opts) {
  return MarcDataField.cloneSubfields(this.subfields, opts);
}

/*
 * Replaces content of the field.
 */
MarcDataField.prototype.assign = function(field) {
  if (!(field instanceof MarcDataField)) {
    return false;
  }
  this.tag = field.tag;
  this.ind1 = field.ind1;
  this.ind2 = field.ind2;
  this.subfields = field.subfields;
  return true;
}

/*
 * Always returns true.
 */
MarcDataField.prototype.isDataField = function() {
  return true;
}

/*
 * Returns true if the fields are equal.
 */
MarcDataField.equals = function(field1, field2, opts) {
  if (opts === true) {
    // For compatibility with the old argument "weakMode".
    opts = {ignoreOrder: true};
  }
  opts = opts || {};

  if (field1 instanceof MarcDataField && field2 instanceof MarcDataField) {
    if (field1.tag !== field2.tag) {
      return false;
    }
    if (opts.normalizeIndicators) {
      if (field1.ind1.replace('#', ' ') !== field2.ind1.replace('#', ' ')
        || field1.ind2.replace('#', ' ') !== field2.ind2.replace('#', ' '))
      {
        return false;
      }
    } else {
      if (field1.ind1 !== field2.ind1 || field1.ind2 !== field2.ind2) {
        return false;
      }
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
    var subfields2 = !opts.ignoreOrder ?
      field2.subfields : field2.subfields.slice();
  } else if (field2 instanceof Array) {
    var subfields2 = !opts.ignoreOrder ? field2 : field2.slice();
  } else {
    return false;
  }

  if (subfields1.length !== subfields2.length) {
    return false;
  }

  if (!opts.ignoreOrder) {
    for (var i = 0; i < subfields1.length; i++) {
      if (!subfields1[i].equals(subfields2[i], opts)) {
        return false;
      }
    }
  } else {
    for (var i = 0; i < subfields1.length; i++) {
      for (var j = 0; j < subfields2.length; j++) {
        if (subfields1[i].equals(subfields2[j], opts)) {
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
MarcDataField.prototype.equals = function(field, opts) {
  return MarcDataField.equals(this, field, opts || {});
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
 * Returns the position of the subfield in the field.
 */
MarcDataField.prototype.getSubfieldIndex = function(subfield) {
  return this.subfields.indexOf(subfield);
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
 * Returns true if exists at least one subfield with the given subfield code.
 */
MarcDataField.prototype.hasSubfield = function(codes) {
  return this.getSubfield(codes) !== null;
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
      && (!codeList || codeList.indexOf(subfield.code) >= 0))
    {
      if (!pattern
        || (pattern instanceof RegExp && pattern.test(subfield.data))
        || (subfield.data === pattern))
      {
        subfields.push(subfield);
      }
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
      && (!codeList || codeList.indexOf(subfield.code) >= 0))
    {
      if (!pattern
        || (pattern instanceof RegExp && pattern.test(subfield.data))
        || (subfield.data === pattern))
      {
        return subfield;
      }
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
      && (!codeList || codeList.indexOf(subfield.code) >= 0))
    {
      if (!pattern
        || (pattern instanceof RegExp && pattern.test(subfield.data))
        || (subfield.data === pattern))
      {
        return subfield.data;
      }
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
 * Returns the list of subfields, equal with specified one.
 */
MarcDataField.prototype.findSubfields = function(subfield, opts) {
  var subfields = [];
  for (var i = 0; i < this.subfields.length; i++) {
    if (subfield.equals(this.subfields[i], opts)) {
      subfields.push(this.subfields[i]);
    }
  }
  return subfields;
}

/*
 * Returns the first subfield, equal with specified one.
 */
MarcDataField.prototype.findSubfield = function(subfield, opts) {
  for (var i = 0; i < this.subfields.length; i++) {
    if (subfield.equals(this.subfields[i], opts)) {
      return this.subfields[i];
    }
  }
  return null;
}

/*
 * Adds subfields.
 */
MarcDataField.prototype.addSubfields = function(subfields) {
  if (!(subfields instanceof Array)) {
    throw new Error('deprecated method addSubfields(index, subfields)');
  }
  Array.prototype.push.apply(this.subfields, subfields);
}

/*
 * Adds a subfield.
 */
MarcDataField.prototype.addSubfield = function(subfield) {
  if (!(subfield instanceof MarcSubfield)) {
    throw new Error('deprecated method addSubfield(index, subfield)');
  }
  this.subfields.push(subfield);
}

/*
 * Adds a subfield if value is not empty.
 */
MarcDataField.prototype.addNonEmptySubfield = function(subfield) {
  if (!(subfield instanceof MarcSubfield)) {
    throw new Error('deprecated method addNonEmptySubfield(index, subfield)');
  }
  if (!subfield.empty()) {
    this.subfields.push(subfield);
  }
}

/*
 * Inserts subfields at the specified position.
 */
MarcDataField.prototype.insertSubfields = function(index, subfields) {
  if (index < 0 || index > this.subfields.length) {
    throw new Error('invalid position specified');
  }
  Array.prototype.splice.apply(this.subfields, [index, 0].concat(subfields));
}

/*
 * Inserts subfield at the specified position.
 */
MarcDataField.prototype.insertSubfield = function(index, subfield) {
  if (index < 0 || index > this.subfields.length) {
    throw new Error('invalid position specified');
  }
  this.subfields.splice(index, 0, subfield);
}

/*
 * Inserts subfields after the specified subfields.
 */
MarcDataField.prototype.insertSubfieldsAfter = function(codes, subfields, opts) {
  var codeList = codes instanceof Array ? codes : [codes];
  opts = opts || {};

  var index = this.subfields.length;
  while (index > 0 && codeList.indexOf(this.subfields[index - 1].code) < 0) {
    index--;
  }

  if (index > 0 || opts.defaultPosition === 'begin') {
    this.insertSubfields(index, subfields);
  } else if (opts.defaultPosition === 'end') {
    this.addSubfields(subfields);
  }
}

/*
 * Inserts subfield after the specified subfields.
 */
MarcDataField.prototype.insertSubfieldAfter = function(codes, subfield, opts) {
  this.insertSubfieldsAfter(codes, [subfield], opts);
}

/*
 * Adds or replaces a subfield.
 */
MarcDataField.prototype.setSubfield = function(subfield, opts) {
  opts = opts || {};

  var subfieldToReplace = null;
  var subfields = this.getSubfields(subfield.code);
  if (subfields.length > 0) {
    switch (opts.replace) {
      case 'first':
        subfieldToReplace = subfields[0];
        break;
      case 'last':
        subfieldToReplace = subfields[subfields.length - 1];
        break;
      case 'all':
      case true:
      case undefined:
        subfieldToReplace = subfields[0];
        for (var i = 1; i < subfields.length; i++) {
          this.removeSubfield(subfields[i]);
        }
        break;
    }
  }

  if (subfieldToReplace === null) {
    this.addSubfield(subfield);
  } else {
    this.subfields[this.subfields.indexOf(subfieldToReplace)] = subfield;
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
 * Reorders subfields according to its codes or callback function.
 */
MarcDataField.prototype.sort = function(opts, callback) {
  if (!callback && opts && opts instanceof Function) {
    callback = opts;
    opts = {};
  } else {
    opts = opts || {};
  }

  if (callback && callback instanceof Function) {
    this.subfields.sort(callback);
    return;
  }

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

    // Compare codes only if they are both numeric or non numeric.
    var aCodeIsNumber = !isNaN(parseInt(a.code));
    var bCodeIsNumber = !isNaN(parseInt(b.code));
    if (aCodeIsNumber === bCodeIsNumber) {
      return a.code < b.code ? -1 : 1;
    }

    if (opts.numericCodesFirst === true) {
      // Sort numeric codes before alphabetical.
      return aCodeIsNumber ? -1 : 1;
    } else {
      // Sort numeric codes after alphabetical.
      return aCodeIsNumber ? 1 : -1;
    }
  });
}

/*
 * Calls a callback for each element of this data field.
 */
MarcDataField.prototype.walk = function(callback) {
  for (var subfieldNo = 0; subfieldNo < this.subfields.length; subfieldNo++) {
    var subfield = this.subfields[subfieldNo];
    callback(subfield, this);
    if (subfield.data instanceof MarcControlField) {
      callback(subfield.data, subfield);
    } else if (subfield.data instanceof MarcDataField) {
      callback(subfield.data, subfield);
      subfield.data.walk(callback);
    }
  }
}

/*
 * Returns a string representation of this data field.
 */
MarcDataField.prototype.toString = function() {
  var textField = this.tag + ' ' + this.ind1 + this.ind2;
  for (var subfieldNo in this.subfields) {
    var subfield = this.subfields[subfieldNo];
    textField += subfield.toString();
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
 * Returns new subfield created from the source format.
 */
MarcSubfield.parse = function(srcSubfield) {
  if (srcSubfield instanceof Object) {
    return MarcSubfield.parseJson(srcSubfield);
  }
  if (typeof(srcSubfield) === 'string') {
    if (/^[ \t\r\n]*\{/.test(srcSubfield)) {
      return MarcSubfield.parseJson(JSON.parse(srcSubfield));
    }
    return MarcSubfield.parseText(srcSubfield);
  }
  throw new Error('invalid subfield');
}

/*
 * Returns new subfield created from the JSON object.
 */
MarcSubfield.parseJson = function(jsonSubfield) {
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
      jsonSubfield.code, MarcVariableField.parseJson(jsonSubfield.data));
  }

  return new MarcSubfield(jsonSubfield.code, jsonSubfield.data);
}

/*
 * Returns new subfield created from the text string.
 */
MarcSubfield.parseText = function(textSubfield) {
  if (typeof(textSubfield) !== 'string'
    || !/^\$[0-9a-z]/i.test(textSubfield))
  {
    throw new Error('invalid subfield');
  }

  var code = textSubfield.slice(1, 2);
  var data = textSubfield.slice(2);
  if (code === '1') {
    var data = textSubfield.slice(2, 5) + ' ' + textSubfield.slice(5);
    return new MarcSubfield(code, MarcVariableField.parseText(data));
  }
  return new MarcSubfield(code, textSubfield.slice(2));
}

/*
 * Returns copy of the specified subfield.
 */
MarcSubfield.clone = function(subfield) {
  if (subfield instanceof MarcSubfield) {
    return new MarcSubfield(subfield);
  }
  return null;
}

/*
 * Returns copy of the subfield.
 */
MarcSubfield.prototype.clone = function() {
  return MarcSubfield.clone(this);
}

/*
 * Replaces content of the subfield.
 */
MarcSubfield.prototype.assign = function(subfield) {
  if (!(subfield instanceof MarcSubfield)) {
    return false;
  }
  this.code = subfield.code;
  this.data = subfield.data;
  return true;
}

/*
 * Returns true if the subfields are equal.
 */
MarcSubfield.equals = function(subfield1, subfield2, opts) {
  if (opts === true) {
    // For compatibility with the old argument "weakMode".
    opts = {ignoreOrder: true};
  }
  opts = opts || {};

  if (!(subfield1 instanceof MarcSubfield)
    || !(subfield2 instanceof MarcSubfield))
  {
    return false;
  }
  if (subfield1.code !== subfield2.code) {
    return false;
  }
  if (subfield1.data instanceof MarcVariableField) {
    return subfield1.data.equals(subfield2.data, opts);
  }

  var data1 = subfield1.data;
  var data2 = subfield2.data;
  if (opts.ignoreCase) {
    data1 = data1.toUpperCase();
    data2 = data2.toUpperCase();
  }
  if (opts.ignoreChars) {
    data1 = data1.replace(opts.ignoreChars, '');
    data2 = data2.replace(opts.ignoreChars, '');
  }
  return (data1 === data2);
}

/*
 * Returns true if the subfields are equal.
 */
MarcSubfield.prototype.equals = function(subfield, opts) {
  return MarcSubfield.equals(this, subfield, opts || {});
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
 * Returns a string representation of this subfield.
 */
MarcSubfield.prototype.toString = function() {
  var textSubfield = '$' + this.code;
  if (!(this.data instanceof MarcVariableField)) {
    if (this.data.length > 0) {
      textSubfield += this.data;
    }
  } else if (this.data) {
    var textEmbeddedField = this.data.toString();
    textSubfield += textEmbeddedField.slice(0, 3) + textEmbeddedField.slice(4);
  }
  return textSubfield;
}

module.exports = {
  MarcVariableField: MarcVariableField,
  MarcControlField: MarcControlField,
  MarcDataField: MarcDataField,
  MarcSubfield: MarcSubfield
};
