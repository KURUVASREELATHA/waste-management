import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Invitation from './models/Invitation.js';
import User from './models/User.js';

dotenv.config();

async function migrateInvitations() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wastewise';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all invitations without recyclingCenterDetails
    const invitations = await Invitation.find({
      recyclingCenterDetails: { $exists: false }
    }).populate('recyclingCenterId');

    console.log(`Found ${invitations.length} invitations to migrate`);

    for (const invitation of invitations) {
      if (invitation.recyclingCenterId) {
        // Get the recycling center details
        const recyclingCenter = await User.findById(invitation.recyclingCenterId._id);
        
        if (recyclingCenter) {
          invitation.recyclingCenterDetails = {
            name: recyclingCenter.name,
            centerName: recyclingCenter.centerName,
            email: recyclingCenter.email,
            phone: recyclingCenter.phone,
            address: recyclingCenter.address,
            wasteTypesProcessed: recyclingCenter.wasteTypesProcessed || []
          };
          
          await invitation.save();
          console.log(`✓ Migrated invitation for ${recyclingCenter.name}`);
        }
      }
    }

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

migrateInvitations();