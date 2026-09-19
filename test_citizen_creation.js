// Simple test to create the citizen user for testing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/waste-wise')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Define User schema
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      role: String,
      houseId: String,
      municipalId: String,
      address: String,
      phone: String,
      qrCode: String
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Check if citizen already exists
    const existingCitizen = await User.findOne({
      $or: [
        { houseId: '1' },
        { name: 'Venkata Sivamma Vayalpeta' },
        { qrCode: 'WW001' }
      ]
    });
    
    if (existingCitizen) {
      console.log('Citizen already exists:', {
        _id: existingCitizen._id,
        name: existingCitizen.name,
        houseId: existingCitizen.houseId,
        email: existingCitizen.email,
        role: existingCitizen.role
      });
      
      // Update with correct details
      await User.findByIdAndUpdate(existingCitizen._id, {
        name: 'Venkata Sivamma Vayalpeta',
        houseId: '1',
        address: 'Kambalapalli,Beerangi post, B.kothakota',
        phone: '1',
        municipalId: 'MU01',
        qrCode: 'WW001',
        role: 'citizen'
      });
      
      console.log('Updated citizen details');
    } else {
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
      console.log('Created new citizen:', {
        _id: savedCitizen._id,
        name: savedCitizen.name,
        houseId: savedCitizen.houseId,
        email: savedCitizen.email,
        role: savedCitizen.role
      });
    }
    
    // Now check all waste records for this citizen
    const wasteSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      type: String,
      weight: Number,
      status: String,
      citizenName: String,
      citizenHouseId: String,
      municipalId: String,
      location: String,
      description: String,
      collectedBy: mongoose.Schema.Types.ObjectId,
      collectedAt: Date,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    
    const Waste = mongoose.model('Waste', wasteSchema);
    
    const citizen = await User.findOne({ houseId: '1' });
    if (citizen) {
      const wasteRecords = await Waste.find({
        $or: [
          { userId: citizen._id },
          { citizenHouseId: '1' },
          { citizenName: { $regex: 'Venkata', $options: 'i' } }
        ]
      }).sort({ createdAt: -1 });
      
      console.log(`Found ${wasteRecords.length} waste records for citizen:`, wasteRecords.map(w => ({
        _id: w._id,
        type: w.type,
        weight: w.weight,
        status: w.status,
        citizenName: w.citizenName,
        citizenHouseId: w.citizenHouseId,
        userId: w.userId,
        createdAt: w.createdAt,
        collectedAt: w.collectedAt
      })));
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });