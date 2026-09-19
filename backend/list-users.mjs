import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';

await mongoose.connect(uri);
const db = mongoose.connection.db;

const collections = await db.listCollections().toArray();
console.log('Collections:', collections.map(c => c.name).join(', '));

for (const name of collections.map(c => c.name)) {
  if (/citizen|municipal|recycl|worker|user/i.test(name)) {
    const docs = await db.collection(name).find({}, { projection: { name: 1, email: 1, role: 1, workerId: 1, phone: 1, municipalId: 1, houseId: 1 } }).toArray();
    console.log(`\n=== ${name} (${docs.length} docs) ===`);
    docs.forEach(d => console.log(JSON.stringify(d)));
  }
}

await mongoose.disconnect();
