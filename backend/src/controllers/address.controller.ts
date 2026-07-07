import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Address } from '../models/Address';

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await Address.find({ userId: req.user!.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, data: addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ userId: req.user!.id }, { isDefault: false });
    }

    const address = await Address.create({
      ...req.body,
      userId: req.user!.id,
    });

    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isDefault } = req.body;

    const address = await Address.findOne({ _id: id, userId: req.user!.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (isDefault) {
      await Address.updateMany({ userId: req.user!.id, _id: { $ne: id } }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    res.json({ success: true, data: address });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, userId: req.user!.id });
    
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
