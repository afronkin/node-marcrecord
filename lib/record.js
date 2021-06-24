var field = require('./field');
var MarcVariableField = field.MarcVariableField;
var MarcControlField = field.MarcControlField;
var MarcDataField = field.MarcDataField;
var MarcSubfield = field.MarcSubfield;

/*
 * Represents a MARC record.
 */
function MarcRecord(record) {
  if (!(this instanceof MarcRecord)) {
    return new MarcRecord(record);
  }

  if (record instanceof MarcRecord) {
    this.leader = record.leader;
    this.fields = [];

    for (var fieldNo = 0; fieldNo < record.fields.length; fieldNo++) {
      var field = record.fields[fieldNo];
      if (field instanceof MarcControlField) {
        this.addVariableField(new MarcControlField(field));
      } else {
        this.addVariableField(new MarcDataField(field));
      }
    }
  } else {
    this.leader = MarcRecord.DEFAULT_LEADER;
    this.fields = record instanceof Array ? record : [];
  }
}

/*
 * Constants.
 */
MarcRecord.DEFAULT_LEADER = '     nam  22        450 ';

/*
 * Returns new record created from the source format.
 */
MarcRecord.parse = function(srcRecord) {
  if (srcRecord instanceof Object) {
    return MarcRecord.parseJson(srcRecord);
  }
  if (typeof(srcRecord) === 'string') {
    if (/^[ \t\r\n]*\{/.test(srcRecord)) {
      return MarcRecord.parseJson(JSON.parse(srcRecord));
    }
    return MarcRecord.parseText(srcRecord);
  }
  throw new Error('invalid record');
}

/*
 * Returns new record created from the JSON object.
 */
MarcRecord.parseJson = function(jsonRecord) {
  if (!(jsonRecord instanceof Object)
    || !(jsonRecord.fields instanceof Array))
  {
    throw new Error('invalid record');
  }

  // Create the new record.
  var record = new MarcRecord();
  record.leader =
    typeof(jsonRecord.leader) === 'string' ? jsonRecord.leader : null;
  for (var i = 0; i < jsonRecord.fields.length; i++) {
    record.fields.push(MarcVariableField.parseJson(jsonRecord.fields[i]));
  }
  return record;
}

/*
 * Returns new record created from the text string.
 */
MarcRecord.parseText = function(textRecord) {
  if (typeof(textRecord) !== 'string') {
    throw new Error('invalid record');
  }

  // Create the new record.
  var record = new MarcRecord();

  var textFields = textRecord.split('\n');
  for (var fieldNo = 0; fieldNo < textFields.length; fieldNo++) {
    var textField = textFields[fieldNo];
    if (textField.indexOf('000 ') === 0) {
      record.leader = textField.slice(4);
    } else if (textField !== '') {
      record.fields.push(MarcVariableField.parseText(textField));
    }
  }
  return record;
}

/*
 * Returns copy of the specified record.
 */
MarcRecord.clone = function(record) {
  if (record instanceof MarcRecord) {
    return new MarcRecord(record);
  }
  return null;
}

/*
 * Returns copy of the record.
 */
MarcRecord.prototype.clone = function() {
  return MarcRecord.clone(this);
}

/*
 * Replaces content of the record.
 */
MarcRecord.prototype.assign = function(record) {
  this.leader = record.leader;
  this.fields = record.fields;
}

/*
 * Returns true if the records are equal.
 */
MarcRecord.equals = function(record1, record2, opts) {
  if (opts === true) {
    // For compatibility with the old argument "weakMode".
    opts = {ignoreOrder: true};
  }
  opts = opts || {};

  if (record1 instanceof MarcRecord && record2 instanceof MarcRecord) {
    if (record1.leader.slice(5, 12) !== record2.leader.slice(5, 12)
      || record1.leader.slice(17) !== record2.leader.slice(17))
    {
      return false;
    }
  }

  if (record1 instanceof MarcRecord) {
    var fields1 = record1.fields;
  } else if (record1 instanceof Array) {
    var fields1 = record1;
  } else {
    return false;
  }

  if (record2 instanceof MarcRecord) {
    var fields2 = !opts.ignoreOrder ? record2.fields : record2.fields.slice();
  } else if (record2 instanceof Array) {
    var fields2 = !opts.ignoreOrder ? record2 : record2.slice();
  } else {
    return false;
  }

  if (fields1.length !== fields2.length) {
    return false;
  }

  if (!opts.ignoreOrder) {
    for (var i = 0; i < fields1.length; i++) {
      if (!fields1[i].equals(fields2[i], opts)) {
        return false;
      }
    }
  } else {
    for (var i = 0; i < fields1.length; i++) {
      for (var j = 0; j < fields2.length; j++) {
        if (fields1[i].equals(fields2[j], opts)) {
          break;
        }
      }
      if (j === fields2.length) {
        return false;
      }
      fields2.splice(j, 1);
    }
  }

  return true;
}

/*
 * Returns true if the records are equal.
 */
MarcRecord.prototype.equals = function(record, opts) {
  return MarcRecord.equals(this, record, opts || {});
}

/*
 * Returns difference between two records.
 */
MarcRecord.diff = function(record1, record2, opts) {
  opts = opts || {};

  if (record1 instanceof MarcRecord && record2 instanceof MarcRecord) {
    if (record1.leader.slice(5, 12) !== record2.leader.slice(5, 12)
      || record1.leader.slice(17) !== record2.leader.slice(17))
    {
      return "leaders is not equal: ["
        + record1.leader + "] [" + record2.leader + "]";
    }
  }

  if (record1 instanceof MarcRecord) {
    var fields1 = record1.fields;
  } else if (record1 instanceof Array) {
    var fields1 = record1;
  } else {
    return "record 1 is not MarcRecord";
  }

  if (record2 instanceof MarcRecord) {
    var fields2 = !opts.ignoreOrder ? record2.fields : record2.fields.slice();
  } else if (record2 instanceof Array) {
    var fields2 = !opts.ignoreOrder ? record2 : record2.slice();
  } else {
    return "record 2 is not MarcRecord";
  }

  if (fields1.length !== fields2.length) {
    return "records have different number of fields: "
      + fields1.length + " " + fields2.length;
  }

  if (!opts.ignoreOrder) {
    for (var i = 0; i < fields1.length; i++) {
      if (!fields1[i].equals(fields2[i], opts)) {
        return "Field [" + fields1[i].toString() + "] not found in record2";
      }
    }
  } else {
    for (var i = 0; i < fields1.length; i++) {
      for (var j = 0; j < fields2.length; j++) {
        if (fields1[i].equals(fields2[j], opts)) {
          break;
        }
      }
      if (j === fields2.length) {
        return "Field [" + fields1[i].toString() + "] not found in record2";
      }
      fields2.splice(j, 1);
    }
  }

  return null;
}

/*
 * Returns difference between two records.
 */
MarcRecord.prototype.diff = function(record, opts) {
  return MarcRecord.diff(this, record, opts || {});
}

/*
 * Returns number of fields in the record.
 */
MarcRecord.prototype.size = function() {
  return this.fields.length;
}

/*
 * Returns true if the record does not contains fields.
 */
MarcRecord.prototype.empty = function() {
  return (this.fields.length === 0);
}

/*
 * Clears all data in the record.
 */
MarcRecord.prototype.clear = function() {
  this.leader = MarcRecord.DEFAULT_LEADER;
  this.fields.length = 0;
}

/*
 * Removes fields and subfields not containing actual data.
 */
MarcRecord.prototype.trim = function() {
  for (var fieldNo = this.fields.length - 1; fieldNo >= 0; fieldNo--) {
    var field = this.fields[fieldNo];
    if (field instanceof MarcDataField) {
      field.trim();
    }
    if (field.empty()) {
      this.fields.splice(fieldNo, 1);
    }
  }
}

/*
 * Returns the position of the variable field in the record.
 */
MarcRecord.prototype.getVariableFieldIndex = function(variableField) {
  return this.fields.indexOf(variableField);
}

/*
 * Adds a variable field.
 */
MarcRecord.prototype.addVariableField = function(variableField) {
  this.fields.push(variableField);
}

/*
 * Adds a variable field when it is not empty.
 */
MarcRecord.prototype.addNonEmptyVariableField = function(variableField) {
  if (!variableField.empty()) {
    this.fields.push(variableField);
  }
}

/*
 * Inserts a variable field at the specified position.
 */
MarcRecord.prototype.insertVariableField = function(index, variableField) {
  if (index < 0 || index > this.fields.length) {
    throw new Error('invalid position specified');
  }
  this.fields.splice(index, 0, variableField);
}

/*
 * Removes a list of variable fields.
 */
MarcRecord.prototype.removeVariableFields = function(variableFields) {
  for (var i = 0; i < variableFields.length; i++) {
    this.removeVariableField(variableFields[i]);
  }
}

/*
 * Removes a variable field.
 */
MarcRecord.prototype.removeVariableField = function(variableField) {
  if (!(variableField instanceof MarcVariableField)) {
    var index = Number(variableField);
    if (isNaN(index) || index < 0 || index >= this.fields.length) {
      throw new Error('invalid field specified: '
        + JSON.stringify(variableField));
    }
    this.fields.splice(index, 1);
    return;
  }

  for (;;) {
    var index = this.fields.indexOf(variableField);
    if (index < 0) {
      break;
    }
    this.fields.splice(index, 1);
  }
}

/*
 * Adds or replaces a subfield.
 */
MarcRecord.prototype.setSubfield = function(tag, ind1, ind2, subfield, opts) {
  var field = this.getDataField(tag, ind1, ind2);
  if (field === null) {
    throw new Error('field "' + tag + '" not found');
  }
  field.setSubfield(subfield, opts);
}

/*
 * Returns a list of variable fields.
 */
MarcRecord.prototype.getVariableFields = function(tags) {
  if (!tags) {
    return this.fields.slice();
  }

  var tagList = tags instanceof Array ? tags : [tags];
  var fields = [];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        fields.push(field);
        break;
      }
    }
  }
  return fields;
}

/*
 * Returns a variable field.
 */
MarcRecord.prototype.getVariableField = function(tags) {
  if (!tags) {
    return this.fields.length > 0 ? this.fields[0] : null;
  }

  var tagList = tags instanceof Array ? tags : [tags];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        return field;
      }
    }
  }
  return null;
}

/*
 * Returns a list of control fields.
 */
MarcRecord.prototype.getControlFields = function(tags) {
  var tagList = !tags ? null : (tags instanceof Array ? tags : [tags]);
  var fields = [];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    if (!(field instanceof MarcControlField)) {
      continue;
    }
    if (!tagList) {
      fields.push(field);
      continue;
    }
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        fields.push(field);
        break;
      }
    }
  }
  return fields;
}

/*
 * Returns a control field.
 */
MarcRecord.prototype.getControlField = function(tags) {
  var fields = this.getControlFields(tags);
  return fields.length > 0 ? fields[0] : null;
}

/*
 * Returns a list of data fields.
 */
MarcRecord.prototype.getDataFields = function(tags, ind1, ind2, opts) {
  opts = opts || {};
  var tagList = !tags ? null : (tags instanceof Array ? tags : [tags]);
  var fields = [];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    if (!(field instanceof MarcDataField)) {
      continue;
    }
    if (opts.normalizeIndicators) {
      if (ind1 && ind1.replace('#', ' ') !== field.ind1.replace('#', ' ')
        || ind2 && ind2.replace('#', ' ') !== field.ind2.replace('#', ' '))
      {
        continue;
      }
    } else {
      if (ind1 && ind1 !== field.ind1 || ind2 && ind2 !== field.ind2) {
        continue;
      }
    }
    if (!tagList) {
      fields.push(field);
      continue;
    }
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        fields.push(field);
        break;
      }
    }
  }
  return fields;
}

/*
 * Returns a data field.
 */
MarcRecord.prototype.getDataField = function(tags, ind1, ind2, opts) {
  var fields = this.getDataFields(tags, ind1, ind2, opts);
  return fields.length > 0 ? fields[0] : null;
}

/*
 * Returns data of the first control field, found by field tag.
 */
MarcRecord.prototype.getControlFieldData = function(tags) {
  var field = this.getVariableField(tags);
  if (!(field && field instanceof MarcControlField)) {
    return null;
  }
  return field.data;
}

/*
 * Returns the control number field or null if no control.
 */
MarcRecord.prototype.getControlNumberField = function() {
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    if (field instanceof MarcControlField && field.tag === '001') {
      return field;
    }
  }
  return null;
}

/*
 * Returns the control number or null if no control number is available.
 */
MarcRecord.prototype.getControlNumber = function() {
  var field = this.getControlNumberField();
  return field ? field.data : null;
}

/*
 * Returns first subfield, found by subfield codes in the first
 * specified field.
 */
MarcRecord.prototype.getSubfield = function(tags, codes) {
  if (!tags) {
    throw new Error('tags must be specified');
  }

  var tagList = tags instanceof Array ? tags : [tags];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        return field.getSubfield(codes);
      }
    }
  }
  return null;
}

/*
 * Returns data of the first subfield, found by subfield codes in the first
 * specified field.
 */
MarcRecord.prototype.getSubfieldData = function(tags, codes) {
  if (!tags) {
    throw new Error('tags must be specified');
  }

  var tagList = tags instanceof Array ? tags : [tags];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        return field.getSubfieldData(codes);
      }
    }
  }
  return null;
}

/*
 * Returns first regular subfield, found by subfield codes and data pattern
 * in the first specified field.
 */
MarcRecord.prototype.getRegularSubfield = function(tags, codes, pattern) {
  if (!tags) {
    throw new Error('tags must be specified');
  }

  var tagList = tags instanceof Array ? tags : [tags];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        return field.getRegularSubfield(codes, pattern);
      }
    }
  }
  return null;
}

/*
 * Returns data of first regular subfield, found by subfield codes
 * and data pattern in the first specified field.
 */
MarcRecord.prototype.getRegularSubfieldData = function(tags, codes, pattern) {
  if (!tags) {
    throw new Error('tags must be specified');
  }

  var tagList = tags instanceof Array ? tags : [tags];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        return field.getRegularSubfieldData(codes, pattern);
      }
    }
  }
  return null;
}

/*
 * Returns control fields, found by field tags and data pattern.
 */
MarcRecord.prototype.findControlFields = function(tags, pattern) {
  if (!tags) {
    throw new Error('tags must be specified');
  }

  var tagList = tags instanceof Array ? tags : [tags];
  var fields = [];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    if (!(field instanceof MarcControlField)) {
      continue;
    }

    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        if (!pattern
          || (pattern instanceof RegExp && pattern.test(field.data))
          || (field.data === pattern))
        {
          fields.push(field);
        }
      }
    }
  }
  return fields;
}

/*
 * Returns data fields, found by field tags, subfield codes and data pattern.
 */
MarcRecord.prototype.findDataFields = function(tags, ind1, ind2, codes, pattern, opts) {
  if (!tags) {
    throw new Error('tags must be specified');
  }

  opts = opts || {};
  var tagList = tags instanceof Array ? tags : [tags];
  var fields = [];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    if (!(field instanceof MarcDataField)) {
      continue;
    }
    if (opts.normalizeIndicators) {
      if (ind1 && ind1.replace('#', ' ') !== field.ind1.replace('#', ' ')
        || ind2 && ind2.replace('#', ' ') !== field.ind2.replace('#', ' '))
      {
        continue;
      }
    } else {
      if (ind1 && ind1 !== field.ind1 || ind2 && ind2 !== field.ind2) {
        continue;
      }
    }

    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        if (field.getRegularSubfield(codes, pattern)) {
          fields.push(field);
        }
      }
    }
  }
  return fields;
}

/*
 * Returns subfields, found by field tags, subfield codes and data pattern.
 */
MarcRecord.prototype.findSubfields = function(tags, ind1, ind2, codes, pattern, opts) {
  if (!tags) {
    throw new Error('tags must be specified');
  }

  opts = opts || {};
  var tagList = tags instanceof Array ? tags : [tags];
  var subfields = [];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    if (!(field instanceof MarcDataField)) {
      continue;
    }
    if (opts.normalizeIndicators) {
      if (ind1 && ind1.replace('#', ' ') !== field.ind1.replace('#', ' ')
        || ind2 && ind2.replace('#', ' ') !== field.ind2.replace('#', ' '))
      {
        continue;
      }
    } else {
      if (ind1 && ind1 !== field.ind1 || ind2 && ind2 !== field.ind2) {
        continue;
      }
    }

    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        var foundSubfields = field.getRegularSubfields(codes, pattern);
        if (foundSubfields.length > 0) {
          Array.prototype.push.apply(subfields, foundSubfields);
        }
      }
    }
  }
  return subfields;
}

/*
 * Returns the Leader.
 */
MarcRecord.prototype.getLeader = function() {
  return this.leader;
}

/*
 * Sets the Leader.
 */
MarcRecord.prototype.setLeader = function(leader) {
  this.leader = leader;
}

/*
 * Reorders fields according to its tags or callback function.
 */
MarcRecord.prototype.sort = function(callback) {
  if (callback && callback instanceof Function) {
    this.fields.sort(callback);
    return;
  }

  var indexes = {};
  for (var i = 0; i < this.fields.length; i++) {
    indexes[this.fields[i]] = i;
  }

  this.fields.sort(function(a, b) {
    // We don't want to reorder fields with the same tags.
    if (a.tag === b.tag) {
      return indexes[a] - indexes[b];
    }
    return a.tag < b.tag ? -1 : 1;
  });
}

/*
 * Calls a callback for each element of the record.
 */
MarcRecord.prototype.walk = function(callback) {
  for (var fieldNo in this.fields) {
    var field = this.fields[fieldNo];
    callback(field, this);
    if (field instanceof MarcDataField) {
      field.walk(callback);
    }
  }
}

/*
 * Returns a string representation of this record.
 */
MarcRecord.prototype.toString = function() {
  var textRecord = '000 ' + this.leader;
  for (var fieldNo in this.fields) {
    textRecord += '\n' + this.fields[fieldNo].toString();
  }
  return textRecord;
}

/*
 * Returns an array of embedded fields, copied from specified fields.
 */
MarcRecord.toEmbeddedFields = function(fields) {
  var subfields = [];
  for (var fieldNo = 0; fieldNo < fields.length; fieldNo++) {
    var field = fields[fieldNo];
    subfields.push(MarcSubfield('1', field.clone()));
  }
  return subfields;
}

/*
 * Returns an array of embedded fields, copied from fields of this record.
 */
MarcRecord.prototype.toEmbeddedFields = function() {
  return MarcRecord.toEmbeddedFields(this.fields);
}

module.exports = {
  MarcRecord: MarcRecord
};
