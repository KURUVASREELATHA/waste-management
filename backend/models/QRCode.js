import mongoose from 'mongoose';

const qrCodeSchema = new mongoose.Schema({
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
  qrCode: { type: String, required: true, unique: true },
  houseId: { type: String, required: true },
  citizenName: { type: String, required: true },
  citizenEmail: { type: String, required: true },
  citizenPhone: String,
  citizenAddress: String,
  totalWasteCollected: { type: Number, default: 0 },
  lastCollectionDate: Date,
  iotData: {
    sensorId: String,
    currentWeight: { type: Number, default: 0 },
    lastReading: Date,
    batteryLevel: Number,
    status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });




export default mongoose.model('QRCode', qrCodeSchema);