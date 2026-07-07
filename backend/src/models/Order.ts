import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  pid: string;
  vid: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  addressId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  status: 'Order Placed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  paymentId?: string; // Razorpay payment ID
  trackingNumber?: string;
}

const OrderItemSchema = new Schema({
  pid: { type: String, required: true },
  vid: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String },
});

const OrderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addressId: { type: Schema.Types.ObjectId, ref: 'Address', required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Order Placed'
  },
  paymentId: { type: String },
  trackingNumber: { type: String },
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
