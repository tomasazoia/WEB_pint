const express = require('express');
const router = express.Router();
const userPreferencesController = require('../controllers/userPreferencesController');

// Rotas CRUD para UserPreferences
router.post('/create', userPreferencesController.createUserPreference);
router.get('/list', userPreferencesController.getAllUserPreferences);
router.get('/listbyid/:id', userPreferencesController.getUserPreferenceById);
router.put('/update/user/:userId', userPreferencesController.updateUserPreferences);
router.delete('/delete/:id', userPreferencesController.deleteUserPreference);
router.get('/list/profile/:id', userPreferencesController.getUserPreferenceByUser);

module.exports = router;
