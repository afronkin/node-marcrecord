var fs = require('fs');
var sax = require('sax');
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

var field = require('./field');
var MarcVariableField = field.MarcVariableField;
var MarcControlField = field.MarcControlField;
var MarcDataField = field.MarcDataField;
var MarcSubfield = field.MarcSubfield;

/*
 * The constructor of MARC XML reader.
 */
function MarcXmlReader(options) {
  if (!(this instanceof MarcXmlReader)) {
    return new MarcXmlReader(options);
  }

  // File with records in XML format.
  this.recordsFile = null;
  // Flag is true when next() can be performed.
  this.readyToRead = false;
  // Position in file.
  this.position = null;

  // XML parser.
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
MarcXmlReader.prototype.openFile = function(recordsFile, options) {
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

  this.parser = sax.createStream(true);
  var parserLevel = 0;

  this.records = [];
  this.positions = [];
  var elements = {
    record: null,
    controlField: null,
    dataField: null,
    subfield: null,
    embeddedControlField: null,
    embeddedDataField: null,
    embeddedSubfield: null,
    attributes: {},
    text: ''
  };

  this.parser.onopentag = function (node) {
    var tag = node.name.toLowerCase();

    if (parserLevel === 0 && tag === 'collection') {
      ;
    } else if (parserLevel === 1 && tag === 'record') {
      elements.record = new MarcRecord();
    } else if (parserLevel === 2 && tag === 'leader') {
      elements.record.leader = '';
    } else if (parserLevel === 2 && tag === 'controlfield') {
      elements.controlField =
        new MarcControlField(elements.attributes.tag || '???', '');
    } else if (parserLevel === 2 && tag === 'datafield') {
      elements.dataField = new MarcDataField(
        elements.attributes.tag || '???',
        elements.attributes.ind1 || '?', elements.attributes.ind2 || '?', []);
    } else if (parserLevel === 3 && tag === 'subfield') {
      elements.subfield =
        new MarcSubfield(elements.attributes.code || '?', '');
    } else if (parserLevel === 3 && tag === 's1') {
      ;
    } else if (parserLevel === 4 && tag === 'leader') {
      elements.embeddedControlField = new MarcControlField('000', '');
    } else if (parserLevel === 4 && tag === 'controlfield') {
      elements.embeddedControlField =
        new MarcControlField(elements.attributes.tag || '???', '');
    } else if (parserLevel === 4 && tag === 'datafield') {
      elements.embeddedDataField = new MarcDataField(
        elements.attributes.tag || '???',
        elements.attributes.ind1 || '?', elements.attributes.ind2 || '?', []);
    } else if (parserLevel === 5 && tag === 'subfield') {
      elements.embeddedSubfield =
        new MarcSubfield(elements.attributes.code || '?', '');
    } else {
      throw new Error('invalid tag "<' + tag + '>"');
    }

    parserLevel++;
    elements.text = '';
    elements.attrs = {};
  }

  this.parser.onclosetag = function (name) {
    var tag = name.toLowerCase();

    parserLevel--;
    if (parserLevel < 0) {
      throw new Error('invalid tag "</' + tag + '>"');
    }

    if (parserLevel === 0 && tag === 'collection') {
      ;
    } else if (parserLevel === 1 && tag === 'record') {
      self.records.push(elements.record);
      self.positions.push(self.parser._parser.position);
    } else if (parserLevel === 2 && tag === 'leader') {
      elements.record.leader = elements.text;
    } else if (parserLevel === 2 && tag === 'controlfield') {
      elements.controlField.data = elements.text;
      elements.record.addVariableField(elements.controlField);
    } else if (parserLevel === 2 && tag === 'datafield') {
      elements.record.addVariableField(elements.dataField);
    } else if (parserLevel === 3 && tag === 'subfield') {
      elements.subfield.data = elements.text;
      elements.dataField.addSubfield(elements.subfield);
    } else if (parserLevel === 3 && tag === 's1') {
      ;
    } else if (parserLevel === 4 && tag === 'leader') {
      elements.embeddedControlField.data = elements.text;
      elements.dataField.addSubfield(new MarcSubfield('1', elements.embeddedControlField));
    } else if (parserLevel === 4 && tag === 'controlfield') {
      elements.embeddedControlField.data = elements.text;
      elements.dataField.addSubfield(new MarcSubfield('1', elements.embeddedControlField));
    } else if (parserLevel === 4 && tag === 'datafield') {
      elements.dataField.addSubfield(new MarcSubfield('1', elements.embeddedDataField));
    } else if (parserLevel === 5 && tag === 'subfield') {
      elements.embeddedSubfield.data = elements.text;
      elements.embeddedDataField.addSubfield(elements.embeddedSubfield);
    } else {
      throw new Error('invalid tag "</' + tag + '>"');
    }

    elements.text = null;
    elements.attrs = {};
  }

  this.parser.onattribute = function (attr) {
    elements.attributes[attr.name] = attr.value;
  }

  this.parser.ontext = function (value) {
    elements.text += value;
  }
}

/*
 * Opens records file by name.
 */
MarcXmlReader.prototype.open = function(recordsFileName) {
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
MarcXmlReader.prototype.openSync = function(recordsFileName, options) {
  var flags = (options || {}).flags || 'r';
  var mode = (options || {}).mode || '0666';
  var recordsFile = fs.openSync(recordsFileName, flags, mode);
  this.openFile(recordsFile, options);
}

/*
 * Closes records file.
 */
MarcXmlReader.prototype.close = function(callback) {
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
MarcXmlReader.prototype.closeSync = function() {
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
MarcXmlReader.prototype.hasNext = function() {
  return this.readyToRead;
}

/*
 * Reads next record from the file.
 */
MarcXmlReader.prototype.next = function(callback) {
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
MarcXmlReader.prototype.nextSync = function() {
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
MarcXmlReader.prototype.read = function(position, size, callback) {
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

      var anotherReader = new MarcXmlReader();
      anotherReader.openFile(this.recordsFile, this.options);
      anotherReader.parser.write(anotherReader.decoder.write(buffer));
      if (anotherReader.records.length == 0) {
        return setImmediate(self.next.bind(self), callback);
      }

      return callback(null, anotherReader.records.shift());
    }
  );
}

/*
 * Reads specified record from the file (sync version).
 */
MarcXmlReader.prototype.readSync = function(position, size) {
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

  var anotherReader = new MarcXmlReader();
  anotherReader.openFile(this.recordsFile, this.options);
  anotherReader.parser.write(anotherReader.decoder.write(buffer));
  return anotherReader.records.shift();
}

/*
 * Returns current position in file.
 */
MarcXmlReader.prototype.getPosition = function() {
  return this.position;
}

module.exports = {
  MarcXmlReader: MarcXmlReader
};
