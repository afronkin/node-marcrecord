var exports = module.exports = {};
exports.MarcIsoReader = MarcIsoReader;

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
 * The constructor of MARC ISO2709 reader.
 */
function MarcIsoReader() {
  if (!(this instanceof MarcIsoReader)) {
    return new MarcIsoReader();
  }

  // File with records in ISO2709 format.
  this.recordsFile = null;
  // Buffer for the record (maximum size of the ISO2709 record is 99999 bytes).
  this.recordBuffer = new Buffer(100000);
  // Input data encoding.
  this.encoding = null;
  // Flag is true when next() can be performed.
  this.readyToRead = false;
}

/*
 * Constants.
 */
MarcIsoReader.ISO_LEADER_SIZE = 24;
MarcIsoReader.ISO_DIR_ENTRY_SIZE = 12;

/*
 * Opens records file.
 */
MarcIsoReader.prototype.open = function(recordsFileName, encoding, callback) {
  var self = this;

  fs.open(recordsFileName, 'r', function(err, recordsFile) {
    if (err) {
      return callback(err);
    }

    self.recordsFile = recordsFile;
    self.readyToRead = true;

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
 * Opens records file (sync version).
 */
MarcIsoReader.prototype.openSync = function(recordsFileName, encoding) {
  this.recordsFile = fs.openSync(recordsFileName, 'r');
  this.readyToRead = true;

  if (encoding && encoding !== 'utf-8'
    && iconv && iconv.encodingExists(encoding))
  {
    this.encoding = encoding;
  } else {
    this.encoding = null;
  }
}

/*
 * Closes records file.
 */
MarcIsoReader.prototype.close = function(callback) {
  var self = this;
  if (self.recordsFile) {
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
MarcIsoReader.prototype.closeSync = function() {
  if (this.recordsFile) {
    fs.closeSync(this.recordsFile);
    this.readyToRead = false;
    this.recordsFile = null;
  }
}

/*
 * Returns true if next record available to read.
 */
MarcIsoReader.prototype.hasNext = function() {
  return this.readyToRead;
}

/*
 * Reads next record from the file.
 */
MarcIsoReader.prototype.next = function(callback) {
  var self = this;
  if (!self.recordsFile) {
    return callback(new Error('records file must be opened'));
  }

  // Read record length.
  fs.read(self.recordsFile, self.recordBuffer, 0, 5, null,
    function(err, bytesRead) {
      if (err) {
        return callback(err);
      }
      if (bytesRead === 0) {
        return callback(null, null);
      } else if (bytesRead !== 5) {
        return callback(new Error('failed to read record length'));
      }

      // Parse record length.
      var recordLength = parseInt(self.recordBuffer.toString('ascii', 0, 5));
      if (isNaN(recordLength)) {
        return callback(new Error('invalid record length'));
      }

      // Read the record.
      fs.read(self.recordsFile, self.recordBuffer, 5, recordLength - 5, null,
        function(err, bytesRead) {
          if (err) {
            return callback(err);
          }

          if (bytesRead != recordLength - 5) {
            self.readyToRead = false;
            return callback(new Error('unexpected end of file'));
          }

          // Parse record data from the buffer.
          try {
            callback(null,
              MarcIsoReader.parseRecord(self.recordBuffer, self.encoding));
          } catch (err) {
            callback(err);
          }
          return;
        }
      );
    }
  );
}

/*
 * Reads next record from the file (sync version).
 */
MarcIsoReader.prototype.nextSync = function() {
  if (!this.recordsFile) {
    throw new Error('records file must be opened');
  }

  // Read record length.
  var bytesRead = fs.readSync(this.recordsFile, this.recordBuffer, 0, 5, null);
  if (bytesRead === 0) {
    return null;
  } else if (bytesRead !== 5) {
    throw new Error('failed to read record length');
  }

  // Parse record length.
  var recordLength = parseInt(this.recordBuffer.toString('ascii', 0, 5));
  if (isNaN(recordLength)) {
    throw new Error('invalid record length');
  }

  // Read the record.
  var bytesRead = fs.readSync(this.recordsFile, this.recordBuffer,
    5, recordLength - 5, null);
  if (bytesRead != recordLength - 5) {
    this.readyToRead = false;
    throw new Error('unexpected end of file');
  }

  // Parse record data from the buffer.
  return MarcIsoReader.parseRecord(this.recordBuffer, this.encoding);
}

/*
 * Parses record data from the buffer.
 */
MarcIsoReader.parseRecord = function(buffer, encoding) {
  // Create the new record.
  var record = new MarcRecord();

  // Get the record leader.
  record.leader = buffer.toString('ascii', 0, MarcIsoReader.ISO_LEADER_SIZE);

  // Parse record length.
  var recordLength = parseInt(record.leader.slice(0, 5));
  if (isNaN(recordLength)) {
    throw new Error('invalid record length');
  }

  // Parse base address of the record data.
  var baseAddress = parseInt(record.leader.slice(12, 17));
  if (isNaN(baseAddress)) {
    throw new Error('invalid base address of the record data');
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
      throw new Error('invalid field length or starting position');
    }

    // Parse field.
    var field = MarcIsoReader.parseField(buffer, encoding,
        fieldTag, baseAddress + fieldStartPos, fieldLength);
    // Append field to the record.
    record.addVariableField(field);
  }

  return record;
}

/*
 * Parses field data from the buffer.
 */
MarcIsoReader.parseField = function(buffer, encoding,
  fieldTag, fieldStartPos, fieldLength)
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
    if (!encoding) {
      fieldData = fieldDataBuffer.toString('utf-8');
    } else {
      fieldData = iconv.decode(fieldDataBuffer, encoding);
    }
    return new MarcControlField(fieldTag, fieldData);
  } else {
    // Parse data field.
    var ind1 = buffer.toString('ascii', fieldStartPos, fieldStartPos + 1);
    var ind2 = buffer.toString('ascii', fieldStartPos + 1, fieldStartPos + 2);
    var dataField = new MarcDataField(fieldTag, ind1, ind2);

    // Parse list of subfields.
    var subfieldStartPos = fieldStartPos + 2;
    for (symbolPos = 2; symbolPos <= fieldLength; symbolPos++) {
      if (buffer.readUInt8(fieldStartPos + symbolPos) != 0x1f
          && symbolPos != fieldLength)
      {
        continue;
      }

      if (symbolPos > 2) {
        // Parse subfield data from the buffer.
        var subfield = MarcIsoReader.parseSubfield(buffer, encoding,
          subfieldStartPos, fieldStartPos + symbolPos - subfieldStartPos);
        dataField.addSubfield(subfield);
      }

      subfieldStartPos = fieldStartPos + symbolPos;
    }
    return dataField;
  }
}

/*
 * Parses subfield data from the buffer.
 */
MarcIsoReader.parseSubfield = function(buffer, encoding,
  subfieldStartPos, subfieldLength)
{
  var subfieldCode =
    buffer.toString('ascii', subfieldStartPos + 1, subfieldStartPos + 2);
  var subfieldDataBuffer =
    buffer.slice(subfieldStartPos + 2, subfieldStartPos + subfieldLength);
  if (!encoding) {
    subfieldData = subfieldDataBuffer.toString('utf-8');
  } else {
    subfieldData = iconv.decode(subfieldDataBuffer, encoding);
  }
  return new MarcSubfield(subfieldCode, subfieldData);
}
