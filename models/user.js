var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  username: { type: String, required: true, minlength: 6, index: true },
  password: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
