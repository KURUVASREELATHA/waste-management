import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const recyclingCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  centerName: {
    type: String
  },
  wasteTypesProcessed: [{
    type: String,
    enum: ['organic', 'plastic', 'paper', 'metal', 'glass', 'mixed']
  }],
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: 'pending'
  },
  wasteReceived: {
    type: Number,
    default: 0
  },
  wasteProcessed: {
    type: Number,
    default: 0
  },
  efficiency: {
    type: Number,
    default: 0
  },
  rates: {
    plastic: { type: Number, default: 0 },
    paper: { type: Number, default: 0 },
    metal: { type: Number, default: 0 },
    organic: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

recyclingCenterSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

recyclingCenterSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('RecyclingCenter', recyclingCenterSchema);