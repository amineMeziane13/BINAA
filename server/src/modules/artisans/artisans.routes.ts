import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './artisans.controller.js';

const router = Router();

router.get('/', controller.list);
router.get('/profile/me', authenticate, controller.getMyProfile);
router.put('/profile', authenticate, controller.updateProfile);
router.post('/subscribe', authenticate, controller.subscribe);
router.get('/:id', controller.getById);

export default router;
