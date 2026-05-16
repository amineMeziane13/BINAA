import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './reviews.controller.js';

const router = Router();

router.get('/:targetProviderId', controller.getForTarget);
router.post('/', authenticate, controller.create);

export default router;
