var fs = require('fs');
var util = require('util');

var iconv = null;
try {
  iconv = require('iconv-lite');
} catch (err) {
  // If module iconv-lite is not present then use only utf-8 encoding.
  iconv = null;
}

var MarcRecord = require('./record').MarcRecord;

var field = require('./field');
var MarcVariableField = field.MarcVariableField;
var MarcControlField = field.MarcControlField;
var MarcDataField = field.MarcDataField;
var MarcSubfield = field.MarcSubfield;

/*
 * The constructor of MARCXML writer.
 */
function MarcXmlWriter(options) {
  if (!(this instanceof MarcXmlWriter)) {
    return new MarcXmlWriter(options);
  }

  // File with records in MARCXML format.
  this.recordsFile = null;
  // Flag is true when write() can be performed.
  this.readyToWrite = false;

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
MarcXmlWriter.prototype.openFile = function(recordsFile, options) {
  this.recordsFile = recordsFile;
  this.readyToWrite = true;

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
MarcXmlWriter.prototype.open = function(recordsFileName) {
  var self = this;
  var options = arguments.length === 3 ? arguments[1] : undefined;
  var callback = arguments.length === 3 ? arguments[2] : arguments[1];

  var flags = (options || {}).flags || 'w';
  var mode = (options || {}).mode || '0666';
  fs.open(recordsFileName, flags, mode, function(err, recordsFile) {
    if (err) { return callback(err); }
    self.openFile(recordsFile, options);

    var header = '<?xml version="1.0" encoding="'
      + (self.options.encoding || 'utf-8') + '" ?>\n<collection>\n';
    var buffer = self.options.encoding ?
      iconv.encode(header, self.options.encoding)
      : new Buffer(header, 'utf-8');
    fs.write(self.recordsFile, buffer, 0, buffer.length, null, callback);
  });
}

/*
 * Opens records file by name (sync version).
 */
MarcXmlWriter.prototype.openSync = function(recordsFileName, options) {
  var flags = (options || {}).flags || 'w';
  var mode = (options || {}).mode || '0666';
  var recordsFile = fs.openSync(recordsFileName, flags, mode);
  this.openFile(recordsFile, options);

  var header = '<?xml version="1.0" encoding="'
    + (this.options.encoding || 'utf-8') + '" ?>\n<collection>\n';
  var buffer = this.options.encoding ?
    iconv.encode(header, this.options.encoding) : new Buffer(header, 'utf-8');
  fs.writeSync(this.recordsFile, buffer, 0, buffer.length, null);
}

/*
 * Closes records file.
 */
MarcXmlWriter.prototype.close = function(callback) {
  var self = this;
  if (self.recordsFile !== null) {
    var footer = '</collection>\n';
    var buffer = self.options.encoding ?
      iconv.encode(footer, self.options.encoding, {addBOM: false})
      : new Buffer(footer, 'utf-8');
    fs.write(self.recordsFile, buffer, 0, buffer.length, null, function(err) {
      if (err) { return callback(err); }
      fs.close(self.recordsFile, function(err) {
        self.readyToWrite = false;
        self.recordsFile = null;
        callback(err);
      });
    });
  }
}

/*
 * Closes records file (sync version).
 */
MarcXmlWriter.prototype.closeSync = function() {
  if (this.recordsFile !== null) {
    var footer = '</collection>\n';
    var buffer = this.options.encoding ?
      iconv.encode(footer, this.options.encoding, {addBOM: false})
      : new Buffer(footer, 'utf-8');
    fs.writeSync(this.recordsFile, buffer, 0, buffer.length, null);

    fs.closeSync(this.recordsFile);
    this.readyToWrite = false;
    this.recordsFile = null;
  }
}

/*
 * Writes record to the file.
 */
MarcXmlWriter.prototype.write = function(record, callback) {
  var self = this;
  if (self.recordsFile === null) {
    return callback(new Error('records file must be opened'));
  }

  var marcXmlRecord = MarcXmlWriter.recordToMarcXml(record, self.options);
  var buffer = self.options.encoding ?
    iconv.encode(marcXmlRecord, self.options.encoding, {addBOM: false})
    : new Buffer(marcXmlRecord, 'utf-8');
  fs.write(self.recordsFile, buffer, 0, buffer.length, null, callback);
}

/*
 * Writes record to the file (sync version).
 */
MarcXmlWriter.prototype.writeSync = function(record) {
  if (this.recordsFile === null) {
    throw new Error('records file must be opened');
  }

  var marcXmlRecord = MarcXmlWriter.recordToMarcXml(record, this.options);
  var buffer = this.options.encoding ?
    iconv.encode(marcXmlRecord, this.options.encoding, {addBOM: false})
    : new Buffer(marcXmlRecord, 'utf-8');
  fs.writeSync(this.recordsFile, buffer, 0, buffer.length, null);
}

/*
 * Converts record to MARCXML string.
 */
MarcXmlWriter.recordToMarcXml = function(record, options) {
  // Initialize elements of the MARCXML record.
  var elements = [];

  // Append leader.
  var leader = record.getLeader();
  elements.push([1, '<record>']);
  elements.push([2, '<leader>%s</leader>', leader]);

  // Iterate fields.
  var fields = record.getVariableFields();
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    MarcXmlWriter.fieldToMarcXml(field, elements, options, 2);
  }

  elements.push([1, '</record>']);

  // Format MARCXML record.
  var marcXmlRecord = '';
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var elementLevel = element[0];
    var elementData = element.slice(1).map(function(value, index) {
      if (index === 0) { return value; }
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    });

    elementString = util.format.apply(null,elementData);
    marcXmlRecord += Array(elementLevel + 1).join('  ') + elementString + '\n';
  }

  return marcXmlRecord;
}

/*
 * Converts field to MARCXML elements.
 */
MarcXmlWriter.fieldToMarcXml = function(field, elements, options, level) {
  if (field.isControlField()) {
    // Append control field.
    elements.push([level, '<controlfield tag="%s">%s</controlfield>',
      field.tag, field.data]);
  } else {
    // Append data field.
    elements.push([level, '<datafield tag="%s" ind1="%s" ind2="%s">',
      field.tag, field.ind1, field.ind2]);

    var subfields = field.getSubfields();
    for (var i = 0; i < subfields.length; i++) {
      var subfield = subfields[i];
      MarcXmlWriter.subfieldToMarcXml(subfield, elements, options, level + 1);
    }

    elements.push([level, '</datafield>']);
  }
}

/*
 * Converts subfield to MARCXML elements.
 */
MarcXmlWriter.subfieldToMarcXml = function(subfield, elements, options,
  level)
{
  if (!subfield.isEmbeddedField()) {
    elements.push([level, '<subfield code="%s">%s</subfield>',
      subfield.code, subfield.data]);
    return;
  }

  if (options.format === 'UNIMARC') {
    elements.push([level, '<s%s>', subfield.code]);
    MarcXmlWriter.fieldToMarcXml(subfield.data, elements, options, level + 1);
    elements.push([level, '</s%s>', subfield.code]);
    return;
  }

  var embeddedField = subfield.data;
  if (embeddedField.isControlField()) {
    elements.push([level, '<subfield code="%s">%s%s</subfield>',
      subfield.code, embeddedField.tag, embeddedField.data]);
    return;
  }

  elements.push([level, '<subfield code="%s">%s%s%s</subfield>',
    subfield.code, embeddedField.tag, embeddedField.ind1, embeddedField.ind2]);
  var embeddedSubfields = embeddedField.getSubfields();
  for (var i = 0; i < embeddedSubfields.length; i++) {
    var embeddedSubfield = embeddedSubfields[i];
    MarcXmlWriter.subfieldToMarcXml(
      embeddedSubfield, elements, options, level);
  }
}

module.exports = {
  MarcXmlWriter: MarcXmlWriter
};
