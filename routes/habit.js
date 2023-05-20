const express = require('express');
const router = express.Router();
const habitsController = require('../controllers/habitsController');

// Page routes
router.get('/', habitsController.habitsPage);
router.get('/dashboard', habitsController.habitsPage);
router.get('/weeklyview', habitsController.weeklyView);

// Action routes
router.post('/create', habitsController.create);
router.get('/delete/:id', habitsController.delete);
router.get('/update/:id/:day/:status', habitsController.update);

module.exports = router;