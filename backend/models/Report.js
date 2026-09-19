import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  image: String, // Citizen's report photo
  status: { type: String, enum: ['pending', 'resolved', 'rejected'], default: 'pending' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  // Worker completion details
  completionPhoto: String, // Worker's completion photo
  completionNotes: String, // Worker's notes about cleanup
  wasteCollected: Number, // Amount of waste collected (kg)
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completionLocation: {
    lat: Number,
    lng: Number
  }, // Worker's location when completing
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);