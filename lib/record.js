var exports = module.exports = {};
exports.MarcRecord = MarcRecord;

var field = require('./field');
var MarcVariableField = field.MarcVariableField;
var MarcControlField = field.MarcControlField;
var MarcDataField = field.MarcDataField;
var MarcSubfield = field.MarcSubfield;

/*
 * The constructor of MARC record.
 */
function MarcRecord(srcRecord) {
  if (!(this instanceof MarcRecord)) {
    return new MarcRecord();
  }

  if (srcRecord instanceof MarcRecord || srcRecord instanceof Object) {
    this.copy(srcRecord);
  } else if (typeof(srcRecord) === 'string') {
    this.copy(JSON.parse(srcRecord));
  } else {
    this.leader = MarcRecord.DEFAULT_LEADER;
    this.fields = [];
  }
}

/*
 * Constants.
 */
MarcRecord.DEFAULT_LEADER = '#####nam  22#####   450 ';

/*
 * Returns 'true' if the records are equal.
 */
MarcRecord.prototype.equals = function(record) {
  if (!(record instanceof MarcRecord)) {
    return false;
  }
  if (this.leader !== record.leader
    || this.fields.length !== record.fields.length)
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
 * Copies data from the specified record.
 */
MarcRecord.prototype.copy = function(srcRecord) {
  if (!(srcRecord instanceof MarcRecord || srcRecord instanceof Object)) {
    throw new Error('wrong record type');
  }

  this.leader = srcRecord.leader;
  this.fields = [];

  for (var i = 0; i < srcRecord.fields.length; i++) {
    var variableField = srcRecord.fields[i];
    if (variableField.hasOwnProperty('data')) {
      this.addVariableField(new MarcControlField(variableField));
    } else {
      this.addVariableField(new MarcDataField(variableField));
    }
  }
}

/*
 * Adds variable field to the record.
 */
MarcRecord.prototype.addVariableField = function(variableField) {
  this.fields.push(variableField);
}

/*
 * Removes variable field from the record.
 */
MarcRecord.prototype.removeVariableField = function(variableField) {
  var fieldNo = this.fields.indexOf(variableField);
  if (fieldNo >= 0) {
    this.fields.splice(fieldNo, 1);
  }
}

/*
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

/*
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

/*
 * Converts record to string representation.
 */
MarcRecord.prototype.toString = function() {
  var textRecord = 'Leader: [' + this.leader + ']\n';
  for (var fieldNo in this.fields) {
    textRecord += this.fields[fieldNo].toString() + '\n';
  }
  return textRecord;
}
