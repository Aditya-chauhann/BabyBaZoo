import mongoose, { Schema, Document } from 'mongoose';
import { IAddress } from './Address'; // Ensure Address is exported if it isn't already, wait Address model has its own schema but the Voltedge model just nested them or what?
// Actually in Voltedge, addresses were nested inside User. Let's look at Voltedge User.model.ts if I need to.
// I can just define the AddressSchema here like WishlistSchema to keep it simple, or reference Address model.
// Wait, the order.controller.ts we wrote used `req.user.addresses`. Did User have addresses? No, we didn't add it yet!
// Let me just add the required fields directly.

export interface IWishlistItem {
  pid: string;
  productName: string;
  productImage: string;
  sellPrice: number;
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: string;
  isEmailVerified: boolean;
  otp?: string;
  otpExpiresAt?: Date;
  wishlist: IWishlistItem[];
  addresses: any[]; // Or define proper interface
  createdAt: Date;
}

const WishlistSchema = new Schema({
  pid: { type: String, required: true },
  productName: { type: String, required: true },
  productImage: { type: String, required: true },
  sellPrice: { type: Number, required: true },
});

const AddressSchema = new Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  role: { type: String, default: 'customer' },
  isEmailVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  wishlist: [WishlistSchema],
  addresses: [AddressSchema],
}, { timestamps: true });

// Add password comparison method
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  const bcrypt = require('bcryptjs');
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);
