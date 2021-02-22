
import express from 'express';
import controller from '../controller/SendMailController'

const router = express.Router();

// check the status of application
router.get('/ping', controller.serverHealthCheck);

// send the mail
router.post('/send', controller.sendmail);

export = router;