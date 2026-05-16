import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/roleGuard.js';
import * as controller from './admin.controller.js';

const router = Router();

router.use(authenticate, allowRoles('ADMIN'));

router.get('/providers', controller.listProviders);
router.patch('/orders/:id/assign', controller.assignOrder);
router.put('/settings/commission', controller.setCommission);

export default router;
