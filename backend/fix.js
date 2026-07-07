const mongoose = require('mongoose');

async function fixOrders() {
  try {
    await mongoose.connect('mongodb://localhost:27017/babybazoo');
    const db = mongoose.connection.db;
    await db.collection('orders').updateMany(
      { 'items.image': { $exists: false } },
      { $set: { 'items.$[].image': '["https://cf.cjdropshipping.com/1619771958547.jpg"]' } }
    );
    await db.collection('orders').updateMany(
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
