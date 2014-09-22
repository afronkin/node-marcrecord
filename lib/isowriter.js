var exports = module.exports = {};
exports.MarcIsoWriter = MarcIsoWriter;

var fs = require('fs');

var iconv = null;
try {
  iconv = require('iconv-lite');
} catch (err) {
  // If module iconv-lite is not present then use only utf-8 encoding.
  iconv = null;
}

var record = require('./record');
var MarcRecord = record.MarcRecord;

var field = require('./field');
var MarcVariableField = field.MarcVariableField;
var MarcControlField = field.MarcControlField;
var MarcDataField = field.MarcDataField;
var MarcSubfield = field.MarcSubfield;

/*
 * The constructor of MARC ISO2709 writer.
 */
function MarcIsoWriter() {
  if (!(this instanceof MarcIsoWriter)) {
    return new MarcIsoWriter();
  }

  // File with records in ISO2709 format.
  this.recordsFile = null;
  // Input data encoding.
  this.encoding = null;
  // Flag is true when write() can be performed.
  this.readyToWrite = false;
}

/*
 * Constants.
 */
MarcIsoWriter.ISO_LEADER_SIZE = 24;
MarcIsoWriter.ISO_DIR_ENTRY_SIZE = 12;

MarcIsoWriter.ISO_RECORD_DELIMITER = '\x1D';
MarcIsoWriter.ISO_FIELD_DELIMITER = '\x1E';
MarcIsoWriter.ISO_CODE_PREFIX = '\x1F';

/*
 * Opens records file.
 */
MarcIsoWriter.prototype.open = function(recordsFileName, encoding, callback) {
  var self = this;

  fs.open(recordsFileName, 'a+', function(err, recordsFile) {
    if (err) {
      return callback(err);
    }

    self.recordsFile = recordsFile;
    self.readyToWrite = true;

    if (encoding && encoding !== 'utf-8'
      && iconv && iconv.encodingExists(encoding))
    {
      self.encoding = encoding;
    } else {
      self.encoding = null;
    }

    callback();
  });
}

/*
 * Closes records file.
 */
MarcIsoWriter.prototype.close = function(callback) {
  var self = this;
  if (self.recordsFile !== null) {
    fs.close(self.recordsFile, function(err) {
      self.readyToWrite = false;
      self.recordsFile = null;
      callback(err);
    });
  }
}

/*
 * Write record to the file.
 */
MarcIsoWriter.prototype.write = function(record, callback) {
  var self = this;
  if (self.recordsFile === null) {
    return callback(new Error('records file must be opened'));
  }

  recordBuffer = new Buffer(100000);
  var recordBufferSize =
    MarcIsoWriter.recordToIso2709(record, recordBuffer, this.encoding);
  fs.write(this.recordsFile, recordBuffer, 0, recordBufferSize, null,
    callback);
}

/*
 * Converts record to ISO2709 buffer.
 */
MarcIsoWriter.recordToIso2709 = function(record, buffer, encoding) {
  // Copy leader to the buffer.
  var leader = record.getLeader();
  if (leader.length !== MarcIsoWriter.ISO_LEADER_SIZE) {
    throw new Error('wrong leader size');
  }
  buffer.write(leader, 0);

  // Get all fields.
  var fields = record.getVariableFields();

  // Calculate base address of data and copy it to record buffer.
  var baseAddress = MarcIsoWriter.ISO_LEADER_SIZE
    + fields.length * MarcIsoWriter.ISO_DIR_ENTRY_SIZE + 1;
  buffer.write(String('00000' + baseAddress).slice(-5), 12);

  // Append field delimiter after directory.
  buffer.write(MarcIsoWriter.ISO_FIELD_DELIMITER, baseAddress - 1);

  // Iterate fields.
  var bufferPos = baseAddress;
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];

    // Append field to the buffer.
    var fieldBufferSize = MarcIsoWriter.fieldToIso2709(
      field, buffer.slice(bufferPos), encoding);

    // Fill directory entry.
    var fieldOffset = bufferPos - baseAddress;
    var directoryEntry = String('000' + field.tag).slice(-3)
      + String('0000' + fieldBufferSize).slice(-4)
      + String('00000' + fieldOffset).slice(-5);
    buffer.write(directoryEntry,
      MarcIsoWriter.ISO_LEADER_SIZE + MarcIsoWriter.ISO_DIR_ENTRY_SIZE * i);

    // Move buffer position.
    bufferPos += fieldBufferSize;
  }

  // Append record delimiter.
  buffer.write(MarcIsoWriter.ISO_RECORD_DELIMITER, bufferPos++);

  // Write record length to the buffer.
  buffer.write(String('00000' + bufferPos).slice(-5), 0);

  return bufferPos;
}

/*
 * Converts field to ISO2709 buffer.
 */
MarcIsoWriter.fieldToIso2709 = function(field, buffer, encoding) {
  if (field.isControlField()) {
    var fieldData;
    if (!encoding) {
      fieldData = new Buffer(field.data, 'utf-8');
    } else {
      fieldData = iconv.encode(field.data, encoding);
    }

    fieldData.copy(buffer);
    buffer.write(MarcIsoWriter.ISO_FIELD_DELIMITER, fieldData.length);
    return fieldData.length + 1;
  }

  // Append indicators to the buffer.
  buffer.write(field.ind1 + field.ind2);

  // Append subfields to the field buffer.
  var bufferPos = 2;
  var subfields = field.getSubfields();
  for (var i = 0; i < subfields.length; i++) {
    var subfield = subfields[i];

    var subfieldBufferSize = MarcIsoWriter.subfieldToIso2709(
      subfield, buffer.slice(bufferPos), encoding);
    bufferPos += subfieldBufferSize;
  }

  buffer.write(MarcIsoWriter.ISO_FIELD_DELIMITER, bufferPos++);
  return bufferPos;
}

/*
 * Converts subfield to ISO2709 buffer.
 */
MarcIsoWriter.subfieldToIso2709 = function(subfield, buffer, encoding) {
  if (!subfield.isEmbeddedField()) {
    buffer.write(MarcIsoWriter.ISO_CODE_PREFIX + subfield.code);

    var subfieldData;
    if (!encoding) {
      subfieldData = new Buffer(subfield.data, 'utf-8');
    } else {
      subfieldData = iconv.encode(subfield.data, encoding);
    }

    subfieldData.copy(buffer, 2);
    return 2 + subfieldData.length;
  }

  buffer.write(MarcIsoWriter.ISO_CODE_PREFIX + subfield.code
    + subfield.data.tag);

  var fieldBufferSize = MarcIsoWriter.fieldToIso2709(
    subfield.data, buffer.slice(5), encoding);
  return 5 + fieldBufferSize;
}