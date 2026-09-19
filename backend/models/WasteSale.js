import mongoose from 'mongoose';

const wasteSaleSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recyclerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wasteType: {
    type: String,
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  pricePerKg: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
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
}, { timestamps: true });

export default mongoose.model('WasteSale', wasteSaleSchema);