import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './products.controller.js';

const router = Router();

router.get('/', controller.list);
router.get('/mine', authenticate, controller.getMyProducts);
router.get('/:id', controller.getById);
router.post('/', authenticate, controller.create);

export default router;
