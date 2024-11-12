const express = require('express');
const router = express.Router();
const FeedController = require('../controllers/feedController');
const authenticate = require('../middleware/authenticate');


router.get('/', authenticate, FeedController.getFeed);

module.exports = router;