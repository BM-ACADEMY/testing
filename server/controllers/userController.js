const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (HR/CEO)
const getUsers = asyncHandler(async (req, res) => {
    // If CEO, get all users or just HRs? Let's give full access or maybe just HRs + Stats
    // If HR, get Employees/Interns
    let query = {};
    if (req.user.role === 'HR') {
        query = { role: { $in: ['Employee', 'Intern'] } };
    } else if (req.user.role === 'CEO') {
        // CEO can see everyone or just HR? Let's say everyone for now, or maybe filter.
        // Prompt says "CEO role must have read-only access to analytics... and overall company attendance insights"
        // It doesn't explicitly say they manage users, but "CEO add the HR".
    }

    const users = await User.find(query).populate('shift', 'name').select('-password');
    res.json(users);
});

// @desc    Create a new user (Hierarchy based)
// @route   POST /api/users
// @access  Private (CEO/HR)
const createUser = asyncHandler(async (req, res) => {
    console.log('createUser body:', req.body);
    const { name, email, password, role, shiftId } = req.body;

    // 1. Validate Requestor Role
    const requestorRole = req.user.role;

    if (requestorRole === 'CEO') {
        if (role !== 'HR') {
            res.status(403);
            throw new Error('CEO can only create HR accounts');
        }
    } else if (requestorRole === 'HR') {
        if (!['Employee', 'Intern'].includes(role)) {
            res.status(403);
            throw new Error('HR can only create Employee or Intern accounts');
        }
    } else {
        res.status(403);
        throw new Error('Not authorized to create users');
    }

    if (!name || !email || !password || !role) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        shift: shiftId // Optional for HR, required for Emp?
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Update user (Assign Shift, Change Role)
// @route   PUT /api/users/:id
// @access  Private (HR)
const updateUser = asyncHandler(async (req, res) => {
    console.log('updateUser body:', req.body);
    // Only HR or CEO should utilize this according to hierarchy
    // HR updates Employee/Intern.

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Authorization to update
    if (req.user.role === 'HR' && !['Employee', 'Intern'].includes(user.role)) {
        res.status(403);
        throw new Error('HR can only update Employees or Interns');
    }

    // Prepare update payload
    const updates = { ...req.body };

    // If updating shiftId, map to shift
    if (updates.shiftId) {
        updates.shift = updates.shiftId;
        delete updates.shiftId;
    }

    // If password provided, hash it
    if (updates.password && updates.password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt);
    } else {
        delete updates.password; // Don't wipe password if empty
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
    }).select('-password');

    res.json(updatedUser);
});

module.exports = {
    getUsers,
    createUser,
    updateUser,
};
