const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['HR', 'Employee', 'Intern', 'CEO'], default: 'Employee' },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
  profileImage: { type: String }, // Path to uploaded profile image
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
