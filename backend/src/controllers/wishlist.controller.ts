import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { User, IWishlistItem } from '../models/User';

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, data: user.wishlist });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const product: IWishlistItem = req.body;
    
    if (!product || !product.pid) {
      return res.status(400).json({ success: false, message: 'Product PID is required' });
    }

    const existingIndex = user.wishlist.findIndex(item => item.pid === product.pid);
    let isAdded = false;

    if (existingIndex > -1) {
      user.wishlist.splice(existingIndex, 1);
    } else {
      user.wishlist.push(product);
      isAdded = true;
    }

    await user.save();
    res.json({ success: true, message: isAdded ? 'Added to wishlist' : 'Removed from wishlist', data: user.wishlist });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
