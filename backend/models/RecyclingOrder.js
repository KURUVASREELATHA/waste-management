import mongoose from 'mongoose';

const recyclingOrderSchema = new mongoose.Schema({
  municipalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    required: true,
    enum: ['plastic', 'paper', 'metal', 'glass', 'organic', 'mixed']
  },
  weight: {
    type: Number,
    required: true
  },
  acceptedWeight: {
    type: Number,
    default: 0
  },
  pricePerKg: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'rejected'],
    default: 'pending'
  },
  processedAt: {
    type: Date
  },
  notes: String,
  verificationCode: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  transactionId: String,
  paymentProof: String,
  paymentNotes: String,
  paidAt: Date
}, {
  timestamps: true
});

// Generate verification code when order is processed
recyclingOrderSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'processed' && !this.verificationCode) {
    this.verificationCode = Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

export default mongoose.model('RecyclingOrder', recyclingOrderSchema);