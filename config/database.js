var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.database);
mongoose.Promise = global.Promise;

mongoose.connection.on('error', () => {
  console.info('Error: Could not connect to MongoDB. Running `mongod`?');
});

mongoose.connection.once('open', () => {
  console.info('mongoose connected');
});

module.exports = mongoose;
