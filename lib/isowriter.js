var fs = require('fs');

var iconv = null;
try {
  iconv = require('iconv-lite');
} catch (err) {
  // If module iconv-lite is not present then use only utf-8 encoding.
  iconv = null;
}

var bufferWrapper = require('./bufferwrapper');
var MarcRecord = require('./record').MarcRecord;

var field = require('./field');
var MarcVariableField = field.MarcVariableField;
var MarcControlField = field.MarcControlField;
var MarcDataField = field.MarcDataField;
var MarcSubfield = field.MarcSubfield;

/*
 * The constructor of MARC ISO2709 writer.
 */
function MarcIsoWriter(options) {
  if (!(this instanceof MarcIsoWriter)) {
    return new MarcIsoWriter(options);
  }

  // File with records in ISO2709 format.
  this.recordsFile = null;
  // Flag is true when write() can be performed.
  this.readyToWrite = false;
  // Position in file.
  this.position = null;

  // File options.
  options = options || {};
  this.options = {
    // Output data encoding.
    encoding: options.encoding || null
  }
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
 * Opens records file by descriptor.
 */
MarcIsoWriter.prototype.openFile = function(recordsFile, options) {
  this.recordsFile = recordsFile;
  this.readyToWrite = true;
  this.position = 0;

  options = options || {};
  if (options.hasOwnProperty('encoding')) {
    if (options.encoding && options.encoding !== 'utf-8'
      && iconv && iconv.encodingExists(options.encoding))
    {
      this.options.encoding = options.encoding;
    } else {
      this.options.encoding = null;
    }
  }
}

/*
 * Opens records file by name.
 */
MarcIsoWriter.prototype.open = function(recordsFileName) {
  var self = this;
  var options = arguments.length === 3 ? arguments[1] : undefined;
  var callback = arguments.length === 3 ? arguments[2] : arguments[1];

  var flags = (options || {}).flags || 'w';
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
MarcIsoWriter.prototype.openSync = function(recordsFileName, options) {
  var flags = (options || {}).flags || 'w';
  var mode = (options || {}).mode || '0666';
  var recordsFile = fs.openSync(recordsFileName, flags, mode);
  this.openFile(recordsFile, options);
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
      self.position = null;
      callback(err);
    });
  }
}

/*
 * Closes records file (sync version).
 */
MarcIsoWriter.prototype.closeSync = function() {
  if (this.recordsFile !== null) {
    fs.closeSync(this.recordsFile);
    this.readyToWrite = false;
    this.recordsFile = null;
    this.position = null;
  }
}

/*
 * Writes record to the file.
 */
MarcIsoWriter.prototype.write = function(record, callback) {
  var self = this;
  if (self.recordsFile === null) {
    return callback(new Error('records file must be opened'));
  }

  recordBuffer = bufferWrapper.allocUnsafe(100000);
  var recordBufferSize =
    MarcIsoWriter.recordToIso2709(record, recordBuffer, self.options);
  fs.write(self.recordsFile, recordBuffer, 0, recordBufferSize, null,
    function(err, written) {
      self.position += written;
      callback(err);
    }
  );
}

/*
 * Writes record to the file (sync version).
 */
MarcIsoWriter.prototype.writeSync = function(record) {
  if (this.recordsFile === null) {
    throw new Error('records file must be opened');
  }

  recordBuffer = bufferWrapper.allocUnsafe(100000);
  var recordBufferSize =
    MarcIsoWriter.recordToIso2709(record, recordBuffer, this.options);
  var written = fs.writeSync(this.recordsFile, recordBuffer, 0,
    recordBufferSize, null);
  this.position += written;
}

/*
 * Returns current position in file.
 */
MarcIsoWriter.prototype.getPosition = function() {
  return this.position;
}

/*
 * Converts record to ISO2709 buffer.
 */
MarcIsoWriter.recordToIso2709 = function(record, buffer, options) {
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
      field, buffer.slice(bufferPos), options);

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
MarcIsoWriter.fieldToIso2709 = function(field, buffer, options, isEmbedded) {
  if (field.isControlField()) {
    var fieldData;
    if (!options || !options.encoding) {
      fieldData = bufferWrapper.from(field.data, 'utf-8');
    } else {
      fieldData = iconv.encode(field.data, options.encoding);
    }

    fieldData.copy(buffer);
    buffer.write(MarcIsoWriter.ISO_FIELD_DELIMITER, fieldData.length);
    return fieldData.length + 1;
  }

  // Append indicators to the buffer.
  var bufferPos = 0;
  if (!isEmbedded) {
    buffer.write(field.ind1 + field.ind2, 'ascii');
    bufferPos += 2;
  }

  // Append subfields to the field buffer.
  var subfields = field.getSubfields();
  for (var i = 0; i < subfields.length; i++) {
    var subfield = subfields[i];

    var subfieldBufferSize = MarcIsoWriter.subfieldToIso2709(
      subfield, buffer.slice(bufferPos), options);
    bufferPos += subfieldBufferSize;
  }

  buffer.write(MarcIsoWriter.ISO_FIELD_DELIMITER, bufferPos++);
  return bufferPos;
}

/*
 * Converts subfield to ISO2709 buffer.
 */
MarcIsoWriter.subfieldToIso2709 = function(subfield, buffer, options) {
  buffer.write(MarcIsoWriter.ISO_CODE_PREFIX + subfield.code);
  if (!subfield.isEmbeddedField()) {
    if (!options || !options.encoding) {
      var subfieldData = bufferWrapper.from(subfield.data, 'utf-8');
    } else {
      var subfieldData = iconv.encode(subfield.data, options.encoding);
    }

    subfieldData.copy(buffer, 2);
    return 2 + subfieldData.length;
  }

  var embeddedHeader = subfield.data.tag;
  if (!subfield.data.isControlField()) {
    embeddedHeader += subfield.data.ind1 + subfield.data.ind2;
  }
  if (!options || !options.encoding) {
    var embeddedHeaderData = bufferWrapper.from(embeddedHeader, 'utf-8');
  } else {
    var embeddedHeaderData = iconv.encode(embeddedHeader, options.encoding);
  }
  embeddedHeaderData.copy(buffer, 2);

  var fieldBufferSize = MarcIsoWriter.fieldToIso2709(
    subfield.data, buffer.slice(2 + embeddedHeaderData.length), options, true);

  // Decrease length by 1 due to ISO_FIELD_DELIMITER.
  return 1 + embeddedHeaderData.length + fieldBufferSize;
}

module.exports = {
  MarcIsoWriter: MarcIsoWriter
};
