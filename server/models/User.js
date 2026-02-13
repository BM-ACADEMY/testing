const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Employee', 'HR', 'CEO', 'Intern'], default: 'Employee' },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
  profileImage: { type: String }, // Path to uploaded profile image
  isActive: { type: Boolean, default: true },

  // Additional Employee Details
  designation: { type: String },
  joiningDate: { type: Date },
  address: { type: String },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''] },
  idNumber: { type: String }, // Employee ID or Badge Number
  phoneNumber: { type: String },
  dob: { type: Date }, // Date of Birth
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
