var jsonreader = exports = module.exports = {};
jsonreader.MarcJsonReader = MarcJsonReader;

var fs = require('fs');

var record = require('./record');
var MarcRecord = record.MarcRecord;

var field = require('./field');
var MarcControlField = field.MarcControlField;
var MarcDataField = field.MarcDataField;
var MarcSubfield = field.MarcSubfield;

/*
 * The constructor of MARC JSON reader.
 */
function MarcJsonReader() {
  if (!(this instanceof MarcJsonReader)) {
    return new MarcJsonReader();
  }

  // File with records in JSON format.
  this.recordsFile = null;
  // Flag is true when next() can be performed.
  this.readyToRead = false;
}

/*
 * Opens records file.
 */
MarcJsonReader.prototype.open = function(recordsFileName, callback) {
  var self = this;

  fs.open(recordsFileName, 'r', function(err, recordsFile) {
    if (err) {
      return callback(err);
    }
    self.recordsFile = recordsFile;
    self.readyToRead = true;
    callback();
  });
}

/*
 * Closes records file.
 */
MarcJsonReader.prototype.close = function(callback) {
  var self = this;
  if (self.recordsFile !== null) {
    fs.close(self.recordsFile, function(err) {
      self.readyToRead = false;
      self.recordsFile = null;
      callback(err);
    });
  }
}

/*
 * Returns true if next record available to read.
 */
MarcJsonReader.prototype.hasNext = function() {
  return this.readyToRead;
}

/*
 * Reads next record from the file.
 */
MarcJsonReader.prototype.next = function(callback) {
  var self = this;
  if (self.recordsFile === null) {
    return callback(new Error('records file must be opened'));
  }
  callback(new Error('not implemented'));
}

/*
 * Parses record from the JSON object.
 */
jsonreader.parseRecord = function(srcRecord) {
  if (typeof(srcRecord) === 'string') {
    srcRecord = JSON.parse(srcRecord);
  }

  if (!(srcRecord instanceof Object)
    || !srcRecord.leader || !srcRecord.fields)
  {
    throw new Error('invalid record');
  }

  // Create the new record.
  var destRecord = new MarcRecord();
  destRecord.leader = srcRecord.leader;
  for (var i = 0; i < srcRecord.fields.length; i++) {
    destRecord.fields.push(jsonreader.parseField(srcRecord.fields[i]));
  }
  return destRecord;
}

/*
 * Parses field from the JSON object.
 */
jsonreader.parseField = function(srcField) {
  if (!(srcField instanceof Object) || !srcField.tag) {
    throw new Error('invalid field');
  }

  if (srcField.hasOwnProperty('data')) {
    return new MarcControlField(srcField.tag, srcField.data);
  }

  var destField =
    new MarcDataField(srcField.tag, srcField.ind1, srcField.ind2);
  for (var i = 0; i < srcField.subfields.length; i++) {
    destField.subfields.push(jsonreader.parseSubfield(srcField.subfields[i]));
  }
  return destField;
}

/*
 * Parses subfield from the JSON object.
 */
jsonreader.parseSubfield = function(srcSubfield) {
  if (!(srcSubfield instanceof Object)
    || !srcSubfield.code || !srcSubfield.data)
  {
    throw new Error('invalid subfield');
  }

  if (srcSubfield.data instanceof Object) {
    return new MarcSubfield(
      srcSubfield.code, jsonreader.parseField(srcSubfield.data));
  }

  return new MarcSubfield(srcSubfield.code, srcSubfield.data);
}
