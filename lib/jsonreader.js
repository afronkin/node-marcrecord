var fs = require('fs');
var Parser = require('jsonparse');
var StringDecoder = require('string_decoder').StringDecoder;

var iconv = null;
try {
  iconv = require('iconv-lite');
} catch (err) {
  // If module iconv-lite is not present then use only utf-8 encoding.
  iconv = null;
}

var bufferWrapper = require('./bufferwrapper');
var MarcRecord = require('./record').MarcRecord;

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
  // Position in file.
  this.position = null;

  // JSON parser.
  this.parser = null;
  // Buffer for reading records from input file.
  this.bufferSize = 4096;
  this.buffer = bufferWrapper.allocUnsafe(this.bufferSize);
  // List of parsed records.
  this.records = null;
  // List of parsed records positions in file.
  this.positions = null;

  // Encoding conversion stream.
  this.decoder = null;

  // File options.
  options = options || {};
  this.options = {
    // MARC format variation (MARC21, UNIMARC).
    format: (options.format || 'UNIMARC').toUpperCase(),
    // Input data encoding.
    encoding: options.encoding || null,
    // Permissive mode (ignore minor errors).
    permissive: options.permissive || false
  }
}

/*
 * Opens records file by descriptor.
 */
MarcJsonReader.prototype.openFile = function(recordsFile, options) {
  var self = this;
  this.recordsFile = recordsFile;
  this.readyToRead = true;
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

  if (iconv && this.options.encoding) {
    this.decoder = iconv.getDecoder(this.options.encoding || 'utf-8');
  } else {
    this.decoder = new StringDecoder('utf-8');
  }

  if (options.hasOwnProperty('permissive')) {
    this.options.permissive = options.permissive;
  }

  this.records = [];
  this.positions = [];

  this.parser = new Parser(true);
  this.parser.onValue = function (value) {
    if (this.stack.length === 0) {
      self.records.push(MarcRecord.parse(value));
      self.positions.push(self.parser.offset + 1);
    }
  }
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
      self.position = null;
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
    this.position = null;
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

  if (self.records.length > 0) {
    self.position = self.positions.shift();
    return callback(null, self.records.shift());
  }

  fs.read(self.recordsFile, self.buffer, 0, self.bufferSize, null,
    function (err, bytesRead) {
      if (err) { return callback(err); }
      if (bytesRead === 0) {
        self.readyToRead = false;
        return callback(null, null);
      }

      self.parser.write(self.decoder.write(self.buffer.slice(0, bytesRead)));
      if (self.records.length == 0) {
        return setImmediate(self.next.bind(self), callback);
      }

      self.position = self.positions.shift();
      return callback(null, self.records.shift());
    }
  );
}

/*
 * Reads next record from the file (sync version).
 */
MarcJsonReader.prototype.nextSync = function() {
  if (this.recordsFile === null) {
    throw new Error('records file must be opened');
  }

  while (this.records.length === 0) {
    var bytesRead =
      fs.readSync(this.recordsFile, this.buffer, 0, this.bufferSize, null);
    if (bytesRead === 0) {
      this.readyToRead = false;
      return null;
    }

    this.parser.write(this.decoder.write(this.buffer.slice(0, bytesRead)));
  }

  this.position = this.positions.shift();
  return this.records.shift();
}

/*
 * Reads specified record from the file.
 */
MarcJsonReader.prototype.read = function(position, size, callback) {
  var self = this;
  if (self.recordsFile === null) {
    return callback(new Error('records file must be opened'));
  }

  var buffer = bufferWrapper.allocUnsafe(size);
  fs.read(self.recordsFile, buffer, 0, size, position,
    function (err, bytesRead) {
      if (err) { return callback(err); }
      if (bytesRead === 0) {
        return callback(null, null);
      } else if (bytesRead !== size) {
        return callback(new Error('unexpected end of file'));
      }
      callback(null, MarcRecord.parse(self.decoder.write(buffer)));
    }
  );
}

/*
 * Reads next record from the file (sync version).
 */
MarcJsonReader.prototype.readSync = function(position, size) {
  if (this.recordsFile === null) {
    throw new Error('records file must be opened');
  }

  var buffer = bufferWrapper.allocUnsafe(size);
  var bytesRead = fs.readSync(this.recordsFile, buffer, 0, size, position);
  if (bytesRead === 0) {
    return null;
  } else if (bytesRead != size) {
    throw new Error('unexpected end of file');
  }
  return MarcRecord.parse(this.decoder.write(buffer));
}

/*
 * Returns current position in file.
 */
MarcJsonReader.prototype.getPosition = function() {
  return this.position;
}

module.exports = {
  MarcJsonReader: MarcJsonReader
};
