/*
 * Creates uninitialized buffer of specified size.
 */
function allocUnsafe(size) {
  return Buffer.allocUnsafe ? Buffer.allocUnsafe(size) : new Buffer(size);
}

/*
 * Creates buffer from specified value.
 */
function from(value, encoding) {
  if (typeof value === 'string') {
    return Buffer.from ? Buffer.from(value, encoding) : new Buffer(value, encoding);
  }
  return Buffer.from ? Buffer.from(value) : new Buffer(value);
}

module.exports = {
  allocUnsafe: allocUnsafe,
  from: from
};
