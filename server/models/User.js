const mongoose = require('../db');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, 
    enum: ['user', 'admin'], 
    default: 'user' },
}, { timestamps: true });

userSchema.pre('save', async function () {
  // async hooks should not use the `next` callback – Mongoose treats
  // a returned promise as signal that the middleware is complete.
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
