const express = require('express');
const router = express.Router();
const campaniasController = require('../controllers/campanias');

router.get('/', campaniasController.getCampanias);
router.post('/campanias', campaniasController.createCampania);
router.delete('/:id', campaniasController.deleteCampania);

module.exports = router;
