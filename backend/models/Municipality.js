import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const municipalitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  profileImage: String,
  municipalId: String,
  workerId: String,
  role: { 
    type: String, 
    enum: ['admin', 'worker'], 
    default: 'worker'
  },
  // Location tracking for workers
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    lastUpdated: { type: Date, default: Date.now }
  },
  isLocationActive: { type: Boolean, default: false },
  vehicleId: String,
  route: String,
  vehicleCapacity: { type: Number, default: 1000 },
  currentLoad: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['available', 'collecting', 'en_route', 'offline'], 
    default: 'offline' 
  }
}, { timestamps: true });

municipalitySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

municipalitySchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('Municipality', municipalitySchema);