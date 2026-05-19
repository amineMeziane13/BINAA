import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { allowRoles } from '../../middleware/roleGuard.js';
import * as controller from './admin.controller.js';

const router = Router();

router.use(authenticate, allowRoles('ADMIN'));

router.get('/providers', controller.listProviders);
router.patch('/orders/:id/assign', controller.assignOrder);
router.put('/settings/commission', controller.setCommission);

// New endpoints for admin dashboard
router.get('/users', controller.listUsers);
router.delete('/users/:id', controller.deleteUser);
router.get('/settings', controller.listSettings);
router.put('/settings/:key', controller.updateSetting);

export default router;
