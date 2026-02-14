const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/stats', authenticate, authorizeAdmin, tripController.getTripStats);
router.get('/active', authenticate, tripController.getActiveTrips);
router.get('/', authenticate, tripController.getTrips);
router.get('/:id', authenticate, tripController.getTrip);
router.post('/', authenticate, authorizeAdmin, tripController.createTrip);
router.put('/:id', authenticate, authorizeAdmin, tripController.updateTrip);
router.put('/:id/status', authenticate, authorizeAdmin, tripController.updateTripStatus);
router.delete('/:id', authenticate, authorizeAdmin, tripController.deleteTrip);

module.exports = router;
