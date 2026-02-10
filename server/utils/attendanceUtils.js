const dayjs = require('dayjs');
const duration = require('dayjs/plugin/duration');
const customParseFormat = require('dayjs/plugin/customParseFormat');

dayjs.extend(duration);
dayjs.extend(customParseFormat);

/**
 * Calculate late minutes based on login time and shift start time
 * @param {Date} loginTime
 * @param {String} shiftStartTime (HH:mm)
 * @param {Number} graceMinutes
 * @returns {Number} lateMinutes
 */
const calculateLateMinutes = (loginTime, shiftStartTime, graceMinutes) => {
    if (!loginTime || !shiftStartTime) return 0;

    const login = dayjs(loginTime);

    // Parse shift start time. Try both 24h and 12h formats.
    let shiftStart = dayjs(shiftStartTime, 'HH:mm', true);
    if (!shiftStart.isValid()) {
        shiftStart = dayjs(shiftStartTime, 'hh:mm A', true);
    }

    if (!shiftStart.isValid()) {
        console.error(`Invalid shift start time format: ${shiftStartTime}`);
        return 0;
    }

    // Set the shift start date to the same day as login
    shiftStart = login
        .set('hour', shiftStart.hour())
        .set('minute', shiftStart.minute())
        .set('second', 0)
        .set('millisecond', 0);

    // Add grace period
    const allowedTime = shiftStart.add(graceMinutes, 'minute');

    if (login.isAfter(allowedTime)) {
        const diff = login.diff(shiftStart, 'minute'); // Late minutes calculated from Shift Start
        return diff;
    }
    return 0;
};

/**
 * Calculate lunch exceeded minutes
 * @param {Date} lunchOut
 * @param {Date} lunchIn
 * @param {Number} allowedDurationMinutes
 * @returns {Number} exceededMinutes
 */
const calculateLunchExceeded = (lunchOut, lunchIn, allowedDurationMinutes) => {
    if (!lunchOut || !lunchIn) return 0;

    const outTime = dayjs(lunchOut);
    const inTime = dayjs(lunchIn);
    const durationMinutes = inTime.diff(outTime, 'minute');

    if (durationMinutes > allowedDurationMinutes) {
        return durationMinutes - allowedDurationMinutes;
    }
    return 0;
};

/**
 * Calculate total permission used
 * @param {Number} lateMinutes
 * @param {Number} lunchExceeded
 * @param {Number} approvedPermissionMinutes
 * @returns {Number} totalMinutes
 */
const calculateTotalPermission = (lateMinutes, lunchExceeded, approvedPermissionMinutes) => {
    return (lateMinutes || 0) + (lunchExceeded || 0) + (approvedPermissionMinutes || 0);
};

module.exports = {
    calculateLateMinutes,
    calculateLunchExceeded,
    calculateTotalPermission
};
