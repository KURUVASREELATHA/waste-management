import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabaseHealth = async () => {
  try {
    console.log('🔍 Checking database connection...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      retryWrites: true,
      retryReads: true
    });
    
    console.log('✅ Database connected successfully');
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`  - ${collection.name}: ${count} documents`);
    }
    
    // Test write operation
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Database health check'
    };
    
    await mongoose.connection.db.collection('healthcheck').insertOne(testDoc);
    console.log('✅ Write operation successful');
    
    // Test read operation
    const readTest = await mongoose.connection.db.collection('healthcheck').findOne({ test: true });
    if (readTest) {
      console.log('✅ Read operation successful');
    }
    
    // Clean up test document
    await mongoose.connection.db.collection('healthcheck').deleteOne({ test: true });
    console.log('✅ Cleanup successful');
    
    // Check indexes
    const wasteIndexes = await mongoose.connection.db.collection('wastes').indexes();
    const reportIndexes = await mongoose.connection.db.collection('reports').indexes();
    
    console.log(`📋 Waste collection indexes: ${wasteIndexes.length}`);
    console.log(`📋 Reports collection indexes: ${reportIndexes.length}`);
    
    console.log('🎉 Database health check completed successfully!');
    
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

checkDatabaseHealth();