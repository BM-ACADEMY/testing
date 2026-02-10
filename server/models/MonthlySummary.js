const mongoose = require('mongoose');

const monthlySummarySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },

    totalWorkingDays: { type: Number, required: true },
    presentDays: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    lopDays: { type: Number, default: 0 },

    totalPermissionMinutes: { type: Number, default: 0 }, // From permissions + late login + lunch exceed
    halfDayDeduction: { type: Boolean, default: false }, // If permissions > 180 min

}, { timestamps: true });

// Ensure one summary per user per month
monthlySummarySchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MonthlySummary', monthlySummarySchema);
