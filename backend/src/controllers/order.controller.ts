import { Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay.service';
import { cjApiService } from '../services/cjApi.service';
import { Address } from '../models/Address';

const getCountryCode = (countryName: string) => {
  if (!countryName) return 'IN';
  const name = countryName.toLowerCase().trim();
  if (name.includes('india')) return 'IN';
  if (name.includes('united states') || name.includes('us') || name.includes('usa')) return 'US';
  if (name.includes('germany') || name === 'de') return 'DE';
  if (name.includes('united kingdom') || name.includes('uk')) return 'GB';
  if (name.includes('canada')) return 'CA';
  if (name.includes('australia')) return 'AU';
  return 'IN';
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { items, addressId, total, paymentMethod } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const savedAddress: any = await Address.findOne({ _id: addressId, userId: req.user!.id });
    if (!savedAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const resolvedItems = await Promise.all(items.map(async (i: any) => {
      let vid = i.vid;
      if (!vid || vid === i.pid) {
        try {
          const detail = await cjApiService.getProductDetail(i.pid);
          if (detail && detail.variants && detail.variants.length > 0) {
            vid = detail.variants[0].vid;
          } else {
            vid = i.pid;
          }
        } catch (error) {
          console.error(`Failed to resolve vid for pid ${i.pid}`, error);
          vid = i.pid;
        }
      }
      return {
        pid: i.pid,
        vid,
        name: i.productName,
        price: i.sellPrice,
        quantity: i.quantity,
        image: i.productImage
      };
    }));

    const order = await Order.create({
      userId: req.user!.id,
      addressId: savedAddress._id,
      items: resolvedItems,
      subtotal: Math.round(total),
      status: 'Order Placed'
    });

    if (paymentMethod === 'cod') {
      const cjPayload = {
        orderNumber: order.id,
        shippingZip: savedAddress.pincode,
        shippingCountryCode: getCountryCode(savedAddress.country || 'India'),
        shippingCountry: savedAddress.country || 'India',
        shippingProvince: savedAddress.state,
        shippingCity: savedAddress.city,
        shippingAddress: `${savedAddress.addressLine1} ${savedAddress.addressLine2 || ''}`.trim(),
        shippingCustomerName: savedAddress.fullName,
        shippingPhone: savedAddress.phone,
        products: order.items.map((i: any) => ({ vid: i.vid, quantity: i.quantity }))
      };
      
      cjApiService.createOrder(cjPayload).catch(err => console.error('CJ Sync error', err));
      
      return res.json({
        success: true,
        data: { orderId: order.id }
      });
    }

    const rzpOrder = await createRazorpayOrder(Math.round(total), order.id);

    res.json({
      success: true,
      data: {
        orderId: order.id,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findOne({ _id: orderId, userId: req.user!.id }).populate('addressId');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      order.status = 'Cancelled';
      await order.save();
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    order.status = 'Processing';
    order.paymentId = razorpayPaymentId;
    await order.save();

    const savedAddress: any = order.addressId;
    const cjPayload = {
      orderNumber: order.id,
      shippingZip: savedAddress.pincode,
      shippingCountryCode: getCountryCode(savedAddress.country || 'India'),
      shippingCountry: savedAddress.country || 'India',
      shippingProvince: savedAddress.state,
      shippingCity: savedAddress.city,
      shippingAddress: `${savedAddress.addressLine1} ${savedAddress.addressLine2 || ''}`.trim(),
      shippingCustomerName: savedAddress.fullName,
      shippingPhone: savedAddress.phone,
      products: order.items.map((i: any) => ({ vid: i.vid, quantity: i.quantity }))
    };
    
    cjApiService.createOrder(cjPayload).catch(err => console.error('CJ Sync error', err));

    res.json({ success: true, message: 'Payment verified successfully', data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find({ userId: req.user!.id }).sort({ createdAt: -1 }).populate('addressId');
    res.json({ success: true, data: orders });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user!.id }).populate('addressId');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.status === 'Cancelled' || order.status === 'Delivered' || order.status === 'Shipped') {
      return res.status(400).json({ success: false, message: `Cannot cancel order in ${order.status} status` });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
