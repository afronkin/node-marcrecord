/**
 * Module dependencies.
 */
var fs = require('fs');
var record = require('./record'),
    MarcRecord = record.MarcRecord;
var field = require('./field'),
    MarcVariableField = field.MarcVariableField,
    MarcControlField = field.MarcControlField,
    MarcDataField = field.MarcDataField,
    MarcSubfield = field.MarcSubfield;

// If module iconv is not present then use only utf-8 encoding.
try {
  Iconv = require('iconv').Iconv;
} catch (e) {
}

/**
 * Expose constructors.
 */
var exports = module.exports = {};
exports.MarcIsoReader = MarcIsoReader;

/**
 * The constructor of MARC ISO2709 reader.
 */
function MarcIsoReader() {
  // File with records in ISO2709 format.
  this.recordsFile = null;
  // Buffer for the record (maximum size of the ISO2709 record is 99999 bytes).
  this.recordBuffer = new Buffer(100000);
  // Iconv object for input encoding conversion.
  this.iconv = null;
}

/**
 * Constants.
 */
MarcIsoReader.ISO_LEADER_SIZE = 24;
MarcIsoReader.ISO_DIR_ENTRY_SIZE = 12;

/**
 * Opens records file.
 */
MarcIsoReader.prototype.open = function(recordsFileName, encoding, callback) {
  var self = this;
  fs.open(recordsFileName, "r", function(error, recordsFile) {
    if (!error) {
      self.recordsFile = recordsFile;

      if (encoding && encoding != 'utf-8' && typeof Iconv === 'function') {
        self.iconv = new Iconv(encoding, 'utf-8');
      } else {
        self.iconv = null;
      }
    }
    callback(error);
  });
}

/**
 * Closes records file.
 */
MarcIsoReader.prototype.close = function(callback) {
  var self = this;
  if (self.recordsFile !== null) {
    fs.close(self.recordsFile, function(error) {
      self.recordsFile = null;
      callback(error);
    });
  }
}

/**
 * Reads next record from the file.
 */
MarcIsoReader.prototype.next = function(record, callback) {
  var self = this;
  if (self.recordsFile === null) {
    callback(new Error('records file must be opened'));
    return;
  }

  // Read record length.
  fs.read(self.recordsFile, self.recordBuffer, 0, 5, null, function(error) {
    if (error) {
      callback(error);
      return;
    }

    // Parse record length.
    var recordLength =
      parseInt(self.recordBuffer.toString('ascii', 0, 5));
    if (isNaN(recordLength)) {
      callback(new Error('invalid record length'));
      return;
    }

    // Read the record.
    fs.read(self.recordsFile, self.recordBuffer, 5, recordLength - 5, null,
      function(error) {
        if (error) {
          callback(error);
          return;
        }

        // Parse record data from the buffer.
        error = MarcIsoReader.parseBuffer(record, self.recordBuffer,
          self.iconv);
        callback(error);
      }
    );
  });
}

/**
 * Parses record data from the buffer.
 */
MarcIsoReader.parseBuffer = function(record, buffer, iconv) {
  // Initialize the record.
  record.clear();

  // Get the record leader.
  record.leader = buffer.toString('ascii', 0, MarcIsoReader.ISO_LEADER_SIZE);

  // Parse record length.
  var recordLength = parseInt(record.leader.slice(0, 5));
  if (isNaN(recordLength)) {
    return new Error('invalid record length');
  }

  // Parse base address of the record data.
  var baseAddress = parseInt(record.leader.slice(12, 17));
  if (isNaN(baseAddress)) {
    return new Error('invalid base address of the record data');
  }

  // Calculate number of the fields.
  var numFields = (baseAddress - record.leader.length - 1)
    / MarcIsoReader.ISO_DIR_ENTRY_SIZE;

  // Parse list of fields.
  for (var fieldNo = 0; fieldNo < numFields; fieldNo++) {
    // Parse directory entry.
    var directoryEntryPos = MarcIsoReader.ISO_LEADER_SIZE
      + (fieldNo * MarcIsoReader.ISO_DIR_ENTRY_SIZE);
    var directoryEntry = buffer.toString('ascii', directoryEntryPos,
        directoryEntryPos + MarcIsoReader.ISO_DIR_ENTRY_SIZE);
    var fieldTag = directoryEntry.slice(0, 3);
    var fieldLength = parseInt(directoryEntry.slice(3, 7));
    var fieldStartPos = parseInt(directoryEntry.slice(7, 12));
    if (isNaN(fieldLength) || isNaN(fieldStartPos)) {
      return new Error('invalid field length or starting position');
    }

    // Parse field.
    var field = MarcIsoReader.parseField(buffer, iconv,
        fieldTag, fieldLength, baseAddress + fieldStartPos);
    // Append field to the record.
    record.addVariableField(field);
  }

  return null;
}

/**
 * Parses field data from the buffer.
 */
MarcIsoReader.parseField = function(buffer, iconv,
    fieldTag, fieldLength, fieldStartPos)
{
  // Adjust field length.
  if (buffer.readUInt8(fieldStartPos + fieldLength - 1) == 0x1e) {
    fieldLength--;
  }

  if (fieldTag < '010') {
    // Parse control field.
    var fieldDataBuffer =
      buffer.slice(fieldStartPos, fieldStartPos + fieldLength);
    var fieldData;
    if (iconv === null) {
      fieldData = fieldDataBuffer.toString();
    } else {
      fieldData = iconv.convert(fieldDataBuffer).toString();
    }
    return new MarcControlField(fieldTag, fieldData);
  } else {
    // Parse data field.
    return new MarcDataField(fieldTag, '1', '2');
  }
}
