const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema (simplified)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'worker', 'admin', 'recycler'], default: 'citizen' },
  houseId: String,
  municipalId: String,
  address: String,
  phone: String,
  qrCode: String
});

const User = mongoose.model('User', userSchema);

async function createTestCitizen() {
  try {
    await mongoose.connect('mongodb://localhost:27017/waste-wise');
    console.log('Connected to MongoDB');

    // Check if citizen already exists
    const existingCitizen = await User.findOne({ 
      $or: [
        { houseId: '1' },
        { name: 'Venkata Sivamma Vayalpeta' }
      ]
    });

    if (existingCitizen) {
      console.log('Citizen already exists:', existingCitizen);
      
      // Update the existing citizen with correct details
      const updatedCitizen = await User.findByIdAndUpdate(
        existingCitizen._id,
        {
          name: 'Venkata Sivamma Vayalpeta',
          houseId: '1',
          address: 'Kambalapalli,Beerangi post, B.kothakota',
          phone: '1',
          municipalId: 'MU01',
          qrCode: 'WW001'
        },
        { new: true }
      );
      
      console.log('Updated citizen:', updatedCitizen);
      process.exit(0);
    }

    // Create new citizen
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const newCitizen = new User({
      name: 'Venkata Sivamma Vayalpeta',
      email: 'venkata.sivamma@example.com',
      password: hashedPassword,
      role: 'citizen',
      houseId: '1',
      municipalId: 'MU01',
      address: 'Kambalapalli,Beerangi post, B.kothakota',
      phone: '1',
      qrCode: 'WW001'
    });

    const savedCitizen = await newCitizen.save();
    console.log('Created new citizen:', savedCitizen);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestCitizen();