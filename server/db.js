// Use the same mongoose instance as database.cjs (root) so connection state is shared
const path = require('path');
module.exports = require(path.join(__dirname, '..', 'node_modules', 'mongoose'));
