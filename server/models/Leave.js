const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    type: { type: String, default: 'Loss of Pay' },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lopDays: { type: Number, default: 0 }, // Calculated after approval
    overrideReason: { type: String }, // Reason for coming to work despite approved leave
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
