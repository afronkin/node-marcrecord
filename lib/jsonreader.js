var exports = module.exports = {};
exports.MarcJsonReader = MarcJsonReader;

var fs = require('fs');

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
