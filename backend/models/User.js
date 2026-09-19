import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'worker', 'admin', 'recycler'], 
    required: true 
  },
  phone: String,
  address: String,
  profileImage: String,
  // Municipal ID for citizens and workers
  municipalId: String,
  // Citizen specific
  upiId: String,
  houseId: String,
  qrCode: { type: String, unique: true, sparse: true },
  // Worker specific
  workerId: String,
  vehicleId: String,
  route: String,
  vehicleCapacity: { type: Number, default: 1000 },
  currentLoad: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['available', 'collecting', 'en_route', 'offline'], 
    default: 'offline' 
  },
  // Location tracking for workers
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    lastUpdated: { type: Date, default: Date.now }
  },
  isLocationActive: { type: Boolean, default: false },
  // Recycling center specific
  centerName: String,
  wasteTypesProcessed: [{ 
    type: String, 
    enum: ['organic', 'plastic', 'paper', 'metal', 'glass', 'mixed'] 
  }],
  paymentStatus: { 
    type: String, 
    enum: ['active', 'overdue', 'suspended'], 
    default: 'active' 
  },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  // Generate unique QR code for citizens if not exists
  if (this.role === 'citizen' && !this.qrCode) {
    this.qrCode = `WW${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);