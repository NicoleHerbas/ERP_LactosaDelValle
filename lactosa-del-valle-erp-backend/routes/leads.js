const express = require('express');
const router = express.Router();
const controller = require('../controllers/leads');

router.get('/', controller.getLeads);
router.get('/:id', controller.getLeadById);
router.post('/', controller.createLead);
router.put('/:id', controller.updateLead);
router.delete('/:id', controller.deleteLead);

module.exports = router;
