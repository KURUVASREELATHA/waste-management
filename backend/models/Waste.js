import mongoose from 'mongoose';

const wasteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  municipalId: { type: String, default: 'MU01' },
  type: { type: String, enum: ['organic', 'plastic', 'paper', 'metal', 'glass', 'mixed'], required: true },
  weight: { type: Number, required: true, min: 0.1 },
  location: { type: String, default: 'Not specified' },
  description: { type: String, default: '' },
  image: String,
  status: { type: String, enum: ['pending', 'collected', 'processed'], default: 'pending' },
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  collectedAt: Date,
  citizenName: String,
  citizenHouseId: String,
  verificationCode: String,
  proofImage: String,
  completionNotes: String,
}, { timestamps: true });

// Ensure proper indexing for performance


export default mongoose.model('Waste', wasteSchema);