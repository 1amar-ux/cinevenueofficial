import { Router } from 'express';
import * as eventController from './events.controller';

const router = Router();

router.get('/events', eventController.getEvents);
router.get('/events/:id', eventController.getEventById);
router.post('/admin/events', eventController.createEvent);
router.put('/admin/events/:id', eventController.updateEvent);
router.post('/events/:id/register', eventController.registerForEvent);
router.post('/events/:id/passes/bulk', eventController.generateBulkPasses);
router.get('/events/passes/:passId', eventController.getPassDetails);
router.post('/events/passes/:passId/check-in', eventController.checkInPass);
router.post('/events/passes/:passId/pdf', eventController.generatePdfPass);

export default router;
