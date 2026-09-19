const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/waste-wise')
  .then(async () => {
    console.log('Connected to MongoDB');
    
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
      createdAt: { type: Date, default: Date.now }
    });
    
    const User = mongoose.model('User', userSchema);
    const Waste = mongoose.model('Waste', wasteSchema);
    
    // Create/find the citizen
    let citizen = await User.findOne({ houseId: '1' });
    
    if (!citizen) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      citizen = new User({
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
      await citizen.save();
      console.log('Created citizen:', citizen._id);
    } else {
      console.log('Found existing citizen:', citizen._id);
    }
    
    // Create a test waste record
    const testWaste = new Waste({
      userId: citizen._id,
      type: 'plastic',
      weight: 3,
      status: 'collected',
      citizenName: 'Venkata Sivamma Vayalpeta',
      citizenHouseId: '1',
      municipalId: 'MU01',
      location: 'Kambalapalli,Beerangi post, B.kothakota',
      description: 'Collected from Venkata Sivamma Vayalpeta - House ID: 1',
      collectedAt: new Date()
    });
    
    await testWaste.save();
    console.log('Created test waste record:', testWaste._id);
    
    // Verify the waste is linked correctly
    const wasteRecords = await Waste.find({ userId: citizen._id });
    console.log(`Found ${wasteRecords.length} waste records for citizen`);
    
    // Test the stats calculation
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayWaste = await Waste.aggregate([
      { 
        $match: { 
          userId: citizen._id,
          status: 'collected',
          $or: [
            { collectedAt: { $gte: todayStart } },
            { createdAt: { $gte: todayStart } }
          ]
        }
      },
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);
    
    const totalWaste = await Waste.aggregate([
      { $match: { userId: citizen._id, status: 'collected' } },
      { $group: { _id: null, total: { $sum: '$weight' } } }
    ]);
    
    console.log('Stats calculation:');
    console.log('Today waste:', todayWaste[0]?.total || 0);
    console.log('Total waste:', totalWaste[0]?.total || 0);
    
    console.log('Citizen login credentials:');
    console.log('Email: venkata.sivamma@example.com');
    console.log('Password: password123');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });