import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './orders.controller.js';

const router = Router();

router.get('/', authenticate, controller.list);
router.post('/', authenticate, controller.create);
router.patch('/:id/pay', authenticate, controller.pay);
router.patch('/:id/status', authenticate, controller.updateStatus);

export default router;
