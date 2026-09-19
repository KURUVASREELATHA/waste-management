import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import RecyclingCenter from './models/RecyclingCenter.js';

await mongoose.connect(process.env.MONGODB_URI);

const existing = await RecyclingCenter.findOne({ email: 'recycler@test.com' });
if (existing) {
  console.log('Recycler already exists');
} else {
  const rc = new RecyclingCenter({
    name: 'Green Recycling Center',
    email: 'recycler@test.com',
    password: 'password123',
    phone: '9999999999',
    address: '321 Recycling Ave',
    centerName: 'Green Recycling Center',
    wasteTypesProcessed: ['plastic', 'paper', 'metal'],
    status: 'active'
  });
  await rc.save();
  console.log('Recycler created:', rc.email);
}
await mongoose.disconnect();
