import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import Report from '../models/Report.js';
import Waste from '../models/Waste.js';
import auth from '../middleware/auth.js';

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const router = express.Router();

// Submit report with image upload
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { location, description, coordinates } = req.body;
    
    const report = new Report({
      userId: req.userId,
      location,
      description,
      coordinates: coordinates ? JSON.parse(coordinates) : undefined,
      image: req.file ? req.file.filename : undefined
    });
    
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get user's reports
router.get('/my-reports', auth, async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all reports (for workers/admin)
router.get('/all', auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('userId', 'name houseId')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete report (by owner, worker, or admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const reportId = req.params.id;
    console.log('Delete request for report ID:', reportId);
    console.log('User ID:', req.userId);
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: 'Invalid report ID format' });
    }
    
    const report = await Report.findById(reportId);
    console.log('Found report:', report ? 'Yes' : 'No');
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Allow deletion by report owner, or if report is resolved (by workers/admin)
    const isOwner = report.userId.toString() === req.userId;
    const isResolved = report.status === 'resolved';
    
    console.log('Is owner:', isOwner, 'Is resolved:', isResolved);
    console.log('Report status:', report.status);
    console.log('Report userId:', report.userId.toString());
    
    if (!isOwner && !isResolved) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }
    
    await Report.findByIdAndDelete(reportId);
    console.log('Report deleted successfully');
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update report status with completion details
router.patch('/:id/complete', auth, upload.single('completionPhoto'), async (req, res) => {
  try {
    const { completionNotes, wasteCollected, completionLocation } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'resolved',
        completionPhoto: req.file ? req.file.filename : undefined,
        completionNotes,
        wasteCollected: parseFloat(wasteCollected) || 0,
        completedBy: req.userId,
        resolvedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'name houseId').populate('completedBy', 'name');
    
    // Create waste record when report is completed
    if (wasteCollected && parseFloat(wasteCollected) > 0 && updatedReport.userId) {
      const waste = new Waste({
        userId: updatedReport.userId._id || updatedReport.userId,
        type: 'mixed',
        weight: parseFloat(wasteCollected),
        location: updatedReport.location,
        description: `Waste collected from resolved report: ${updatedReport.description}`,
        status: 'collected',
        collectedBy: req.userId,
        collectedAt: new Date()
      });
      await waste.save();
    }
    
    res.json(updatedReport);
  } catch (error) {
    console.error('Report completion error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update report status (simple)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status, completionPhoto, completionNotes, wasteCollected } = req.body;
    
    const updateData = {
      status,
      ...(status === 'resolved' && { 
        assignedTo: req.userId, 
        resolvedAt: new Date(),
        completedBy: req.userId,
        ...(completionPhoto && { completionPhoto }),
        ...(completionNotes && { completionNotes }),
        ...(wasteCollected && { wasteCollected: parseFloat(wasteCollected) })
      })
    };
    
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name houseId').populate('completedBy', 'name');
    
    // Create waste record when report is completed with waste collected
    if (status === 'resolved' && wasteCollected && parseFloat(wasteCollected) > 0) {
      const waste = new Waste({
        userId: report.userId._id,
        type: 'mixed',
        weight: parseFloat(wasteCollected),
        location: report.location,
        description: `Waste collected from resolved report: ${report.description}`,
        status: 'collected',
        collectedBy: req.userId,
        collectedAt: new Date()
      });
      await waste.save();
    }
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;