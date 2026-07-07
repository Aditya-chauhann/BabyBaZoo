import mongoose from 'mongoose';
import { Order } from './src/models/Order';

async function fixOrders() {
  try {
    await mongoose.connect('mongodb://localhost:27017/babybazoo');
    await Order.updateMany(
      { 'items.image': { $exists: false } },
      { $set: { 'items.$[].image': '["https://cf.cjdropshipping.com/1619771958547.jpg"]' } }
    );
    await Order.updateMany(
      { 'items.image': null },
      { $set: { 'items.$[].image': '["https://cf.cjdropshipping.com/1619771958547.jpg"]' } }
    );
    console.log('Fixed orders!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixOrders();
