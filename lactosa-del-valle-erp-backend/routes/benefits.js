const express = require('express');
const router = express.Router();
const controller = require('../controllers/benefits');

router.get('/', controller.getAllBenefits);
router.get('/:id', controller.getBenefitById);
router.post('/', controller.createBenefit);
router.put('/:id', controller.updateBenefit);
router.delete('/:id', controller.deleteBenefit);

module.exports = router;