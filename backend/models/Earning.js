import mongoose from 'mongoose';

const earningSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wasteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Waste', required: true },
  amount: { type: Number, required: true },
  creditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: String,
  status: { type: String, enum: ['pending', 'credited'], default: 'credited' },
}, { timestamps: true });

export default mongoose.model('Earning', earningSchema);