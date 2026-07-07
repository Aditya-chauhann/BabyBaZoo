import { Router } from 'express';
import { createOrder, verifyPayment, getOrders, getOrder, cancelOrder } from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.post('/create', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrder);
router.post('/:id/cancel', protect, cancelOrder);

export default router;
