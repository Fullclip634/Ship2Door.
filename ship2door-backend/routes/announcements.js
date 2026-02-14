const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', authenticate, announcementController.getAnnouncements);
router.post('/', authenticate, authorizeAdmin, announcementController.createAnnouncement);
router.delete('/:id', authenticate, authorizeAdmin, announcementController.deleteAnnouncement);

module.exports = router;
