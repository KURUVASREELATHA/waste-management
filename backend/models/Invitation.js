import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
  municipalityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recyclingCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Store recycling center details for better data persistence
  recyclingCenterDetails: {
    name: String,
    centerName: String,
    email: String,
    phone: String,
    address: String,
    wasteTypesProcessed: [String]
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: String,
  sentAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date
}, {
  timestamps: true
});

export default mongoose.model('Invitation', invitationSchema);