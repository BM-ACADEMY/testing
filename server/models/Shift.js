const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    name: { type: String, required: true },
    loginTime: { type: String, required: true }, // Format HH:mm
    gracePeriod: { type: Number, required: true }, // In minutes
    lunchStart: { type: String, required: true }, // Format HH:mm
    maxLunchDuration: { type: Number, required: true }, // In minutes
    logoutTime: { type: String, required: true }, // Format HH:mm
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
