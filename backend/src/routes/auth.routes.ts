import { Router } from 'express';
import { register, login, getMe, verifyOtp, sendSecurityOtp, securityAction } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getMe);
router.post('/send-security-otp', protect, sendSecurityOtp);
router.post('/security-action', protect, securityAction);

export default router;
