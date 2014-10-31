var marcrecord = require('marcrecord');

var marcReader = new marcrecord.MarcIsoReader();
marcReader.openSync('records.iso');

while (record = marcReader.nextSync()) {
  var field = record.getVariableField('200');
  if (field) {
    var subfield = field.getSubfield('a');
    if (subfield && subfield.data === 'The Oxford Russian minidictionary') {
      console.log('Found the book.');
      break;
    }
  }
}

marcReader.closeSync();
