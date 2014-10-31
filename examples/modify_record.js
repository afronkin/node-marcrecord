var marcrecord = require('marcrecord');

var MarcRecord = marcrecord.MarcRecord;
var MarcControlField = marcrecord.MarcControlField;
var MarcDataField = marcrecord.MarcDataField;
var MarcSubfield = marcrecord.MarcSubfield;

// Create empty record.
var record = new MarcRecord();

// Create new control field in the record.
var controlField = new MarcControlField('001', '00012345');
record.addVariableField(controlField);

// Create new data field with subfields in the record.
var dataField = new MarcDataField('200', '1', ' ');
dataField.addSubfield(new MarcSubfield('a', 'Title'));
dataField.addSubfield(new MarcSubfield('f', 'Editor'));
record.addVariableField(dataField);

// Find all fields with the specified tags.
var fields = record.getVariableFields(['001', '200']);
for (var i = 0; i < fields.length; i++) {
  var field = fields[i];

  // Print field content as string.
  console.log(field.toString());

  // Check the field tag.
  if (field.tag === '200') {
    // Modify the field indicator.
    field.ind2 = '2';

    // Find all subfields with the specified codes.
    var subfields = field.getSubfields(['a', 'f']);
    for (var j = 0; j < subfields.length; j++) {
      var subfield = subfields[j];

      // Print subfield content as string.
      console.log(subfield.data.toString());

      // Modify the subfield content.
      if (subfield.code === 'a') {
        subfield.data = 'New title';
      }
    }
  }
}

// Modify leader.
var leader = record.leader;
record.leader = leader.slice(0, 7) + 's' + leader.slice(8);

// Print record content as string.
console.log('\nModified record:');
console.log(record.toString());
