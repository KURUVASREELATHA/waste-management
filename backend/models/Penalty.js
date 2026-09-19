import mongoose from 'mongoose';

const penaltySchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
  municipalId: { type: String, default: 'MU01' },
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Municipality', required: true }, // Municipal worker
  
  // Penalty details
  violationType: { 
    type: String, 
    enum: ['improper_segregation', 'mixed_waste', 'hazardous_disposal', 'overweight', 'no_segregation'], 
    required: true 
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  
  // Evidence
  evidenceImage: String,
  location: String,
  wasteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Waste' }, // Related waste collection
  
  // Status and payment
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'disputed', 'waived'], 
    default: 'pending' 
  },
  paymentMethod: String,
  paymentDate: Date,
  paymentReference: String,
  
  // Dispute handling
  disputeReason: String,
  disputeDate: Date,
  disputeResolution: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Municipality' },
  
  // Citizen details (for quick access)
  citizenName: String,
  citizenHouseId: String,
  
  dueDate: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days from issue
}, { timestamps: true });

export default mongoose.model('Penalty', penaltySchema);