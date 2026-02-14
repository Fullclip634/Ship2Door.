const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.post('/', authenticate, bookingController.createBooking);
router.get('/my', authenticate, bookingController.getMyBookings);
router.get('/all', authenticate, authorizeAdmin, bookingController.getAllBookings);
router.get('/:id', authenticate, bookingController.getBooking);
router.put('/:id/status', authenticate, authorizeAdmin, bookingController.updateBookingStatus);
router.put('/:id/pickup', authenticate, authorizeAdmin, bookingController.updatePickupSchedule);

module.exports = router;
