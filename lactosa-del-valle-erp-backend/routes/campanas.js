const express = require('express');
const router = express.Router();
const campanasController = require('../controllers/campanasController');

router.get('/', campanasController.getCampanas);
router.post('/', campanasController.createCampana);

module.exports = router;
