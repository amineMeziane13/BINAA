import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import * as controller from './auth.controller.js';

const router = Router();

router.post('/register', controller.register);
router.post('/login', controller.login);
router.delete('/me', authenticate, controller.deleteAccount); // Handled by auth controller to avoid circular deps

export default router;
