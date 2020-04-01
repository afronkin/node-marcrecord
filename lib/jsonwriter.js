var fs = require('fs');

var iconv = null;
try {
  iconv = require('iconv-lite');
} catch (err) {
  // If module iconv-lite is not present then use only utf-8 encoding.
  iconv = null;
}

var bufferWrapper = require('./bufferwrapper');

/*
 * The constructor of JSON writer.
 */
function MarcJsonWriter(options) {
  if (!(this instanceof MarcJsonWriter)) {
    return new MarcJsonWriter(options);
  }

  // File with records in JSON format.
  this.recordsFile = null;
  // Flag is true when write() can be performed.
  this.readyToWrite = false;
  // Position in file.
  this.position = null;

  // File options.
  options = options || {};
  this.options = {
    // MARC format variation (MARC21, UNIMARC).
    format: (options.format || 'UNIMARC').toUpperCase(),
    // Output data encoding.
    encoding: options.encoding || null
  }
}

/*
 * Opens records file by descriptor.
 */
MarcJsonWriter.prototype.openFile = function(recordsFile, options) {
  this.recordsFile = recordsFile;
  this.readyToWrite = true;
  this.position = 0;

  options = options || {};

  if (options.hasOwnProperty('format')) {
    this.options.format = (options.format || 'UNIMARC').toUpperCase();
  }

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
MarcJsonWriter.prototype.open = function(recordsFileName) {
  var self = this;
  var options = arguments.length === 3 ? arguments[1] : undefined;
  var callback = arguments.length === 3 ? arguments[2] : arguments[1];

  var flags = (options || {}).flags || 'w';
  var mode = (options || {}).mode || '0666';
  fs.open(recordsFileName, flags, mode, function(err, recordsFile) {
    if (err) { return callback(err); }
    self.openFile(recordsFile, options);
    callback(null);
  });
}

/*
 * Opens records file by name (sync version).
 */
MarcJsonWriter.prototype.openSync = function(recordsFileName, options) {
  var flags = (options || {}).flags || 'w';
  var mode = (options || {}).mode || '0666';
  var recordsFile = fs.openSync(recordsFileName, flags, mode);
  this.openFile(recordsFile, options);
}

/*
 * Closes records file.
 */
MarcJsonWriter.prototype.close = function(callback) {
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
MarcJsonWriter.prototype.closeSync = function() {
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
MarcJsonWriter.prototype.write = function(record, callback) {
  var self = this;
  if (self.recordsFile === null) {
    return callback(new Error('records file must be opened'));
  }

  var marcJsonRecord = JSON.stringify(record, null, 2) + '\n';
  var buffer = self.options.encoding ?
    iconv.encode(marcJsonRecord, self.options.encoding, {addBOM: false})
    : bufferWrapper.from(marcJsonRecord, 'utf-8');
  fs.write(self.recordsFile, buffer, 0, buffer.length, null,
    function(err, written) {
      self.position += written;
      callback(err);
    }
  );
}

/*
 * Writes record to the file (sync version).
 */
MarcJsonWriter.prototype.writeSync = function(record) {
  if (this.recordsFile === null) {
    throw new Error('records file must be opened');
  }

  var marcJsonRecord = JSON.stringify(record, null, 2) + '\n';
  var buffer = this.options.encoding ?
    iconv.encode(marcJsonRecord, this.options.encoding, {addBOM: false})
    : bufferWrapper.from(marcJsonRecord, 'utf-8');
  
  var written = fs.writeSync(this.recordsFile, buffer, 0,
    buffer.length, null);
  this.position += written;
}

/*
 * Returns current position in file.
 */
MarcJsonWriter.prototype.getPosition = function() {
  return this.position;
}

module.exports = {
  MarcJsonWriter: MarcJsonWriter
};
