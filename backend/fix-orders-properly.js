const mongoose = require('mongoose');

async function fixOrders() {
  try {
    await mongoose.connect('mongodb://localhost:27017/babybazoo');
    const db = mongoose.connection.db;
    
    // We will just unset the image field so it falls back to 'Img' rather than the wrong nail clipper image.
    // The user prefers the 'Img' placeholder over the wrong image.
    // Actually, we can do better: map product names to images based on what we know!
    
    const orders = await db.collection('orders').find().toArray();
    for (let order of orders) {
      let updatedItems = [];
      for (let item of order.items) {
        let correctImage = item.image;
        
        if (item.name.includes("Solar Ant")) {
            correctImage = "https://cf.cjdropshipping.com/5f3bb4e4-72f1-4db5-b82b-986fcb813739.jpg";
        } else if (item.name.includes("Nail Clipper")) {
            correctImage = "https://cf.cjdropshipping.com/1619771958547.jpg";
        } else if (item.name.includes("Breathable Cotton Training Pants")) {
            correctImage = "https://cf.cjdropshipping.com/1632733857500.jpg";
        } else if (item.name.includes("Corduroy Jacket")) {
            correctImage = "https://cf.cjdropshipping.com/00ba9956-7788-4f09-9464-1a3e9500ee08.jpg";
        } else {
            correctImage = "https://cf.cjdropshipping.com/1619771958547.jpg"; // fallback
        }
        
        updatedItems.push({
          ...item,
          image: correctImage
        });
      }
      await db.collection('orders').updateOne({ _id: order._id }, { $set: { items: updatedItems } });
    }

    console.log('Fixed orders properly!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixOrders();
