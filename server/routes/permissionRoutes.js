const express = require('express');
const router = express.Router();
const { requestPermission, getPermissions, updatePermissionStatus } = require('../controllers/permissionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, requestPermission)
    .get(protect, getPermissions);

router.route('/:id/status')
    .put(protect, updatePermissionStatus);

module.exports = router;
