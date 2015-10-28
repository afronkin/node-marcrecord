var exports = module.exports = {};
exports.MarcRecord = MarcRecord;

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
MarcRecord.DEFAULT_LEADER = '#####nam  22#####   450 ';

/*
 * Returns true if the records are equal.
 */
MarcRecord.prototype.equals = function(record) {
  if (!(record instanceof MarcRecord)) {
    return false;
  }

  if (this.fields.length !== record.fields.length
    || this.leader.slice(5, 12) !== record.leader.slice(5, 12)
    || this.leader.slice(17) !== record.leader.slice(17))
  {
    return false;
  }

  for (var i = 0; i < this.fields.length; i++) {
    if (!this.fields[i].equals(record.fields[i])) {
      return false;
    }
  }

  return true;
}

/*
 * Returns number of fields in the record.
 */
MarcRecord.prototype.size = function() {
  return this.fields.length;
}

/*
 * Clears all data in the record.
 */
MarcRecord.prototype.clear = function() {
  this.leader = MarcRecord.DEFAULT_LEADER;
  this.fields.length = 0;
}

/*
 * Adds a variable field.
 */
MarcRecord.prototype.addVariableField = function(variableField) {
  this.fields.push(variableField);
}

/*
 * Removes a variable field.
 */
MarcRecord.prototype.removeVariableField = function(variableField) {
  var fieldNo = this.fields.indexOf(variableField);
  if (fieldNo >= 0) {
    this.fields.splice(fieldNo, 1);
  }
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
      }
    }
  }
  return fields;
}

/*
 * Returns a list of data fields.
 */
MarcRecord.prototype.getDataFields = function(tags, ind1, ind2) {
  var tagList = !tags ? null : (tags instanceof Array ? tags : [tags]);
  var fields = [];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    if (!(field instanceof MarcDataField)
      || ind1 && ind1 !== field.ind1 || ind2 && ind2 !== field.ind2)
    {
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
      }
    }
  }
  return fields;
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
 * Returns first subfield, found by field tags and subfield codes.
 */
MarcRecord.prototype.getSubfield = function(tags, codes) {
  if (!tags) {
    return this.fields.length > 0 ? this.fields[0].getSubfield(codes) : null;
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
 * Returns data of the first subfield, found by field tags and subfield codes.
 */
MarcRecord.prototype.getSubfieldData = function(tags, codes) {
  if (!tags) {
    return this.fields.length > 0 ?
      this.fields[0].getSubfieldData(codes) : null;
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
 * Returns a list of VariableField objects with the given tags that have a
 * data element that matches the given regular expression.
 */
MarcRecord.prototype.find = function(tags, pattern) {
  var tagList = !tags ? null : (tags instanceof Array ? tags : [tags]);
  var fields = [];
  for (var fieldNo = 0; fieldNo < this.fields.length; fieldNo++) {
    var field = this.fields[fieldNo];
    if (!tagList && field.find(pattern)) {
      fields.push(field);
      continue;
    }
    for (var i in tagList) {
      var tag = tagList[i];
      if (tag instanceof RegExp && tag.test(field.tag) || tag === field.tag) {
        if (field.find(pattern)) {
          fields.push(field);
        }
      }
    }
  }
  return fields;
}

/*
 * Reorders fields according to its tags.
 */
MarcRecord.prototype.sort = function() {
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
 * Returns a string representation of this record.
 */
MarcRecord.prototype.toString = function() {
  var textRecord = 'Leader: [' + this.leader + ']';
  for (var fieldNo in this.fields) {
    textRecord += '\n' + this.fields[fieldNo].toString();
  }
  return textRecord;
}
