const mongoose = require('mongoose');

const companyHolidaySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['Public Holiday', 'Company Event', 'Festival', 'Other'],
        default: 'Public Holiday'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

// Index for faster queries
companyHolidaySchema.index({ date: 1 });

module.exports = mongoose.model('CompanyHoliday', companyHolidaySchema);
