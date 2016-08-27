var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.database);
mongoose.connection.on('error', function() {
  console.info('Error: Could not connect to MongoDB. Running `mongod`?');
});

module.exports = mongoose;