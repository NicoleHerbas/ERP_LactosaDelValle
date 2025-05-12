const express = require('express');
const router = express.Router();
const controller = require('../controllers/payroll');

router.get('/', controller.getAllPayrolls);
router.get('/:id', controller.getPayrollById);
router.post('/', controller.createPayroll);
router.put('/:id', controller.updatePayroll);
router.delete('/:id', controller.deletePayroll);

module.exports = router;