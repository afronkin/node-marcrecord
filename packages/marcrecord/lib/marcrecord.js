/*
 * MARC record module.
 */

/*
 * The MARC record constructor.
 */
function MarcRecord() {
    // The record leader.
    this.leader = null;
    // List of fields of the record.
    this.fields = [];
}

/*
 * Returns number of fields in the record.
 */
MarcRecord.prototype.size = function() {
    return this.fields.length;
}

// Export the class.
module.exports = MarcRecord;
