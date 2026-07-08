const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  phone: { type: Number, unique: true, sparse: true },
  email: { type: String, unique: true, sparse: true },
  location: { type: Object },
  lastSeenAt: { type: Number },
  name: { type: String },
  age: { type: Number },
  photoUrl: { type: String },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
