node-marcrecord
===============
MARC record library for Node.js allows to read and write records in ISO2709 and MARCXML
containers and manipulate MARC record content (such as fields, subfields,
record leader etc).

Implements similar API as C++ library "marcrecord".

#Basic Example
```javascript
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
```

Advanced Examples
-------------
See the `test` and `examples` directories for more use cases.
