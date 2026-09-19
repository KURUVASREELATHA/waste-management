import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  recyclingCenterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  paidAt: Date,
  dueDate: { type: Date, required: true },
}, { timestamps: true });

paymentSchema.index({ recyclingCenterId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Payment', paymentSchema);