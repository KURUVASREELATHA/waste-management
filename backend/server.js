import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import authRoutes from './routes/auth.js';
import wasteRoutes from './routes/waste.js';
import reportRoutes from './routes/reports.js';
import earningRoutes from './routes/earnings.js';
import recyclingCenterRoutes from './routes/recyclingCenters.js';
import wasteSaleRoutes from './routes/wasteSales.js';
import recyclingRoutes from './routes/recycling.js';
import productRoutes from './routes/products.js';
import invitationRoutes from './routes/invitations.js';
import paymentRoutes from './routes/payments.js';
import qrCodeRoutes from './routes/qrcode.js';
import penaltyRoutes from './routes/penalties.js';
import workerRoutes from './routes/workers.js';
import fixRoutes from './routes/fix.js';
import dataSyncService from './services/dataSync.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// No request logging
app.use((req, res, next) => {
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/earnings', earningRoutes);
app.use('/api/recycling-centers', recyclingCenterRoutes);
app.use('/api/waste-sales', wasteSaleRoutes);
console.log('Waste-sales routes registered at /api/waste-sales');
app.use('/api/recycling', recyclingRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/qrcode', qrCodeRoutes);
app.use('/api/penalties', penaltyRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/fix', fixRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  const syncStatus = dataSyncService.getQueueStatus();
  
  res.json({
    status: 'ok',
    database: states[dbState],
    sync: syncStatus,
    timestamp: new Date().toISOString()
  });
});

// Data sync status endpoint
app.get('/api/sync/status', (req, res) => {
  res.json(dataSyncService.getQueueStatus());
});

// Force sync endpoint
app.post('/api/sync/force', async (req, res) => {
  try {
    await dataSyncService.forceProcessQueue();
    res.json({ message: 'Sync queue processed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
});

// MongoDB persistent connection with better configuration
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';
console.log('Connecting to MongoDB...');

mongoose.connect(mongoUri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  retryWrites: true,
  retryReads: true,
  maxIdleTimeMS: 30000,
  heartbeatFrequencyMS: 10000
}).catch(err => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
  dataSyncService.forceProcessQueue();
});

mongoose.connection.on('error', (err) => {});

mongoose.connection.on('disconnected', () => {});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await dataSyncService.forceProcessQueue();
  } catch (error) {}
  
  await mongoose.connection.close();
  process.exit(0);
});

// Add error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {});