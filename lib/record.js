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
function MarcRecord(srcRecord) {
  if (!(this instanceof MarcRecord)) {
    return new MarcRecord(srcRecord);
  }

  if (srcRecord instanceof MarcRecord) {
    this.leader = srcRecord.leader;
    this.fields = [];

    for (var i = 0; i < srcRecord.fields.length; i++) {
      var field = srcRecord.fields[i];
      if (field instanceof MarcControlField) {
        this.addVariableField(new MarcControlField(field));
      } else {
        this.addVariableField(new MarcDataField(field));
      }
    }
  } else {
    this.leader = MarcRecord.DEFAULT_LEADER;
    this.fields = srcRecord instanceof Array ? srcRecord : [];
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

  var tagList = typeof(tags) === 'string' ? [tags] : tags;
  var fields = [];
  for (var i = 0; i < this.fields.length; i++) {
    var field = this.fields[i];
    if (tagList.indexOf(field.tag) >= 0) {
      fields.push(field);
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

  var tagList = typeof(tags) === 'string' ? [tags] : tags;
  for (var i = 0; i < this.fields.length; i++) {
    var field = this.fields[i];
    if (tagList.indexOf(field.tag) >= 0) {
      return field;
    }
  }
  return null;
}

/*
 * Returns a list of control fields.
 */
MarcRecord.prototype.getControlFields = function() {
  var fields = [];
  for (var i = 0; i < this.fields.length; i++) {
    var field = this.fields[i];
    if (field instanceof MarcControlField) {
      fields.push(field);
    }
  }
  return fields;
}

/*
 * Returns a list of data fields.
 */
MarcRecord.prototype.getDataFields = function() {
  var fields = [];
  for (var i = 0; i < this.fields.length; i++) {
    var field = this.fields[i];
    if (field instanceof MarcDataField) {
      fields.push(field);
    }
  }
  return fields;
}

/*
 * Returns the control number field or null if no control.
 */
MarcRecord.prototype.getControlNumberField = function() {
  for (var i = 0; i < this.fields.length; i++) {
    var field = this.fields[i];
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
  var controlField = this.getControlNumberField();
  return controlField ? controlField.data : null;
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
  var tagList = typeof(tags) === 'string' ? [tags] : tags;
  var fields = [];
  for (var i = 0; i < this.fields.length; i++) {
    var field = this.fields[i];
    if ((!tagList || tagList.indexOf(field.tag) >= 0) && field.find(pattern)) {
      fields.push(field);
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
