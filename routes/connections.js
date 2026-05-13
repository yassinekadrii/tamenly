const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/request', connectionController.requestConnection);
router.post('/create-dummy', connectionController.createDummyPatient);
router.post('/log-contact/:doctorId', connectionController.logWhatsAppContact);
router.get('/contact-log/:patientId', connectionController.getContactLog);
router.put('/accept/:patientId', connectionController.acceptConnection);
router.put('/block/:patientId', connectionController.blockConnection);
router.put('/unblock/:patientId', connectionController.unblockConnection);
router.get('/', connectionController.getConnections);

module.exports = router;
