const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .select('-password')
        .populate('shift', 'name startTime endTime');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.json(user);
});

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Update password if provided
    if (req.body.password && req.body.password.trim() !== '') {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
    });
});

// @desc    Upload profile image
// @route   POST /api/profile/image
// @access  Private
const uploadProfileImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    // Delete old profile image if exists
    if (user.profileImage) {
        const fs = require('fs');
        const oldImagePath = user.profileImage;
        if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
        }
    }

    // Save new image path
    user.profileImage = req.file.path;
    await user.save();

    res.json({
        message: 'Profile image uploaded successfully',
        profileImage: user.profileImage
    });
});

// @desc    Delete profile image
// @route   DELETE /api/profile/image
// @access  Private
const deleteProfileImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!user.profileImage) {
        res.status(400);
        throw new Error('No profile image to delete');
    }

    // Delete image file
    const fs = require('fs');
    if (fs.existsSync(user.profileImage)) {
        fs.unlinkSync(user.profileImage);
    }

    // Remove from database
    user.profileImage = null;
    await user.save();

    res.json({ message: 'Profile image deleted successfully' });
});

module.exports = {
    getProfile,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
};
