var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    minlength: [4, 'Username must be at least 4 characters'],
    unique: true
  },
  password: {
    type: String
  },
  email: {
    type: String,
    require: [true, 'Email is required'],
    unique: true
  }
}, {timestamps: true});

UserSchema.plugin(passportLocalMongoose);

export default mongoose.model('User', UserSchema);
