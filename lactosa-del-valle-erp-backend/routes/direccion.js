// routes/direccionRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/direccionController');

router.get('/kpis', controller.getKPIs);
router.get('/reportes', controller.getReportes);
router.get('/top-vendedores', controller.getTopVendedores);

module.exports = router;