/**
 * Module dependencies.
 */
var fs = require('fs');
var marcrecord = require('./marcrecord'),
    MarcRecord = marcrecord.MarcRecord,
    MarcVariableField = marcrecord.MarcVariableField,
    MarcControlField = marcrecord.MarcControlField,
    MarcDataField = marcrecord.MarcDataField,
    MarcSubfield = marcrecord.MarcSubfield;

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
  // Encoding of the records in ISO2709 file.
  this.encoding = 'utf-8';
  // Buffer for the record (maximum size of the ISO2709 record is 99999 bytes).
  this.recordBuffer = new Buffer(100000);
}

/**
 * Opens records file.
 */
MarcIsoReader.prototype.open = function(recordsFileName, encoding, callback) {
  var self = this;
  fs.open(recordsFileName, "r", function(error, recordsFile) {
    if (!error) {
      self.recordsFile = recordsFile;
      self.encoding = encoding;
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
      parseInt(self.recordBuffer.toString(self.encoding, 0, 5));
    if (recordLength === NaN) {
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
          self.encoding);
        callback(error);
      }
    );
  });
}

/**
 * Parses record data from the buffer.
 */
MarcIsoReader.parseBuffer = function(record, buffer, encoding) {
  // Validate function arguments.
  encoding = encoding || 'utf8';

  // Initialize the record.
  record.clear();

  // Get the record leader.
  record.leader = buffer.toString(encoding, 0, 24);

  // Parse record length.
  var recordLength = parseInt(record.leader.slice(0, 5));
  if (recordLength === NaN) {
    return new Error('invalid record length');
  }

  // Parse base address of the record data.
  var baseAddress = parseInt(record.leader.slice());
  if (recordLength === NaN) {
    return new Error('invalid base address of the record data');
  }

  return null;
}
