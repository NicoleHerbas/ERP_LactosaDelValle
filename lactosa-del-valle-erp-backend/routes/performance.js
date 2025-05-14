const express = require('express');
const router = express.Router();
const controller = require('../controllers/performance');

router.post('/', controller.createEvaluation);
router.get('/', controller.getEvaluations);

module.exports = router;
