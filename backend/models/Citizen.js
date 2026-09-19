import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const citizenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  address: String,
  profileImage: String,
  municipalId: String,
  upiId: String,
  houseId: String,
  qrCode: String
}, { timestamps: true });

citizenSchema.pre('save', async function(next) {
  if (!this.qrCode) {
    this.qrCode = `WW${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

citizenSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('Citizen', citizenSchema);