const express = require('express');

const router = express.Router();

router.get('/viewAny', profiles)
router.get('/viewOwn', profile)

module.exports = router
