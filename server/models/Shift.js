const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    name: { type: String, required: true },
    loginTime: { type: String, required: true }, // Format HH:mm
    graceTime: { type: Number, required: true, default: 15 }, // In minutes
    lunchStartTime: { type: String, required: true }, // Format HH:mm
    lunchDuration: { type: Number, required: true, default: 45 }, // In minutes
    logoutTime: { type: String, required: true }, // Format HH:mm
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
