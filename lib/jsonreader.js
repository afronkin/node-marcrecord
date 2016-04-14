var fs = require('fs');

var MarcRecord = require('./record').MarcRecord;

var field = require('./field');
var MarcControlField = field.MarcControlField;
var MarcDataField = field.MarcDataField;
var MarcSubfield = field.MarcSubfield;

/*
 * The constructor of MARC JSON reader.
 */
function MarcJsonReader(options) {
  if (!(this instanceof MarcJsonReader)) {
    return new MarcJsonReader(options);
  }

  // File with records in JSON format.
  this.recordsFile = null;
  // Flag is true when next() can be performed.
  this.readyToRead = false;
}

/*
 * Opens records file by descriptor.
 */
MarcJsonReader.prototype.openFile = function(recordsFile, options) {
  this.recordsFile = recordsFile;
  this.readyToRead = true;
}

/*
 * Opens records file by name.
 */
MarcJsonReader.prototype.open = function(recordsFileName) {
  var self = this;
  var options = arguments.length === 3 ? arguments[1] : undefined;
  var callback = arguments.length === 3 ? arguments[2] : arguments[1];

  var flags = (options || {}).flags || 'r';
  var mode = (options || {}).mode || '0666';
  fs.open(recordsFileName, flags, mode, function(err, recordsFile) {
    if (err) { return callback(err); }
    self.openFile(recordsFile, options);
    callback();
  });
}

/*
 * Opens records file by name (sync version).
 */
MarcJsonReader.prototype.openSync = function(recordsFileName, options) {
  var flags = (options || {}).flags || 'r';
  var mode = (options || {}).mode || '0666';
  var recordsFile = fs.openSync(recordsFileName, flags, mode);
  this.openFile(recordsFile, options);
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
 * Closes records file (sync version).
 */
MarcJsonReader.prototype.closeSync = function() {
  if (this.recordsFile !== null) {
    fs.closeSync(this.recordsFile);
    this.readyToRead = false;
    this.recordsFile = null;
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
 * Reads next record from the file (sync version).
 */
MarcJsonReader.prototype.nextSync = function() {
  if (this.recordsFile === null) {
    throw new Error('records file must be opened');
  }
  throw new Error('not implemented');
}

/*
 * Parses record from the JSON object.
 */
MarcJsonReader.parseRecord = function(srcRecord) {
  if (typeof(srcRecord) === 'string') {
    srcRecord = JSON.parse(srcRecord);
  }

  if (!(srcRecord instanceof Object) || !(srcRecord.fields instanceof Array)) {
    throw new Error('invalid record');
  }

  // Create the new record.
  var destRecord = new MarcRecord();
  destRecord.leader =
    typeof(srcRecord.leader) === 'string' ? srcRecord.leader : null;
  for (var i = 0; i < srcRecord.fields.length; i++) {
    destRecord.fields.push(MarcJsonReader.parseField(srcRecord.fields[i]));
  }
  return destRecord;
}

/*
 * Parses field from the JSON object.
 */
MarcJsonReader.parseField = function(srcField) {
  if (!(srcField instanceof Object) || typeof(srcField.tag) !== 'string') {
    throw new Error('invalid field');
  }

  if (srcField.hasOwnProperty('data')) {
    return new MarcControlField(srcField.tag, srcField.data);
  }

  var destField =
    new MarcDataField(srcField.tag, srcField.ind1, srcField.ind2);
  for (var i = 0; i < srcField.subfields.length; i++) {
    destField.subfields.push(
      MarcJsonReader.parseSubfield(srcField.subfields[i]));
  }
  return destField;
}

/*
 * Parses subfield from the JSON object.
 */
MarcJsonReader.parseSubfield = function(srcSubfield) {
  if (!(srcSubfield instanceof Object)
    || (typeof(srcSubfield.code) !== 'string'
      && typeof(srcSubfield.code) !== 'c')
    || (typeof(srcSubfield.data) !== 'string'
      && !(srcSubfield.data instanceof Object)))
  {
    throw new Error('invalid subfield');
  }

  if (srcSubfield.data instanceof Object) {
    return new MarcSubfield(
      srcSubfield.code, MarcJsonReader.parseField(srcSubfield.data));
  }

  return new MarcSubfield(srcSubfield.code, srcSubfield.data);
}

module.exports = {
  MarcJsonReader: MarcJsonReader
};
