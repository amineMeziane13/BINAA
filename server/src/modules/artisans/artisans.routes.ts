import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './artisans.controller.js';

const router = Router();

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.put('/profile', authenticate, controller.updateProfile);
router.post('/subscribe', authenticate, controller.subscribe);

export default router;
