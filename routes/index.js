const express = require('express');
const router = express.Router();
router.use('/', require('./habit'));
module.exports = router;