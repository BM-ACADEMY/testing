const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true }, // Store as Date object set to midnight
    shiftName: { type: String }, // Snapshot of potential dynamic shift
    loginTime: { type: Date },
    logoutTime: { type: Date },
    lunchOut: { type: Date },
    lunchIn: { type: Date },
    // Legacy fields for today's records before schema update
    lunchOutTime: { type: Date },
    lunchInTime: { type: Date },

    // Calculated fields
    lateMinutes: { type: Number, default: 0 },
    lunchExceededMinutes: { type: Number, default: 0 },
    totalPermissionMinutes: { type: Number, default: 0 }, // Late + Lunch + Short Permission
    isHalfDay: { type: Boolean, default: false },

    status: {
        type: String,
        enum: ['Present', 'Absent', 'Half-Day', 'Holiday', 'Weekend', 'On-Leave'],
        default: 'Absent'
    },
    lopDays: { type: Number, default: 0 }, // 0, 0.5, 1, 2
}, { timestamps: true });

// Compound index just in case
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
