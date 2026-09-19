import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import WasteSale from './models/WasteSale.js';

dotenv.config();

const fixRecyclerData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find recycling centers
    const recyclers = await User.find({ role: 'recycler' });
    console.log(`Found ${recyclers.length} recyclers`);

    if (recyclers.length === 0) {
      console.log('No recyclers found, creating one...');
      const recycler = new User({
        name: 'Green Recycling Center',
        email: 'recycler@wastewise.com',
        password: 'password123',
        role: 'recycler',
        centerName: 'Green Recycling Center',
        address: 'Madanapalle Industrial Area',
        phone: '9876543210',
        wasteTypesProcessed: ['plastic', 'paper', 'metal', 'glass']
      });
      await recycler.save();
      recyclers.push(recycler);
      console.log('Created recycler:', recycler.name);
    }

    // Find workers
    const workers = await User.find({ role: 'worker' });
    console.log(`Found ${workers.length} workers`);

    // Update waste sales with proper recycler and seller IDs
    const wasteSales = await WasteSale.find();
    console.log(`Found ${wasteSales.length} waste sales to update`);

    for (const sale of wasteSales) {
      const updateData = {};
      
      // Assign recycler if null
      if (!sale.recyclerId && recyclers.length > 0) {
        updateData.recyclerId = recyclers[0]._id;
      }
      
      // Assign seller if null
      if (!sale.sellerId && workers.length > 0) {
        updateData.sellerId = workers[0]._id;
      }
      
      if (Object.keys(updateData).length > 0) {
        await WasteSale.findByIdAndUpdate(sale._id, updateData);
        console.log(`Updated waste sale ${sale._id}`);
      }
    }

    console.log('Recycler data fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing recycler data:', error);
    process.exit(1);
  }
};

fixRecyclerData();