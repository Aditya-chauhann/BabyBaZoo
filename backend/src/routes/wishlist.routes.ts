import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, getWishlist);
router.post('/toggle', protect, toggleWishlist);

export default router;
