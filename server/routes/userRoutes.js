const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize('HR', 'CEO'), getUsers)
    .post(protect, authorize('HR', 'CEO'), createUser);

router.route('/:id')
    .put(protect, authorize('HR', 'CEO'), updateUser);
// CEO might need to update HR? Logic inside controller handles granular checks.

module.exports = router;
