import mongoose from 'mongoose';
import User from '../models/User.js';

const setupAdmin = async () => {
  try {
    console.log('🔧 Starting setup...');
    console.log('📊 Connecting to MongoDB...');
    
    // HARDCODE the URI to get it working
    const MONGODB_URI = 'mongodb://localhost:27017/inventory_db';
    console.log('Using URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');
    
    // Check if admin already exists
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (!adminExists) {
      // Create admin user
      await User.create({
        name: 'System Administrator',
        email: 'admin@inventory.com',
        password: 'admin123',
        role: 'admin'
      });
      
      console.log('🎉 First admin user created successfully!');
      console.log('==========================================');
      console.log('📧 Email: admin@inventory.com');
      console.log('🔑 Password: admin123');
      console.log('⚠️  IMPORTANT: Change the password after first login!');
      console.log('==========================================');
    } else {
      console.log('✅ Admin user already exists in the database');
      console.log('📧 Email:', adminExists.email);
    }
    
    await mongoose.disconnect();
    console.log('📊 MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    process.exit(1);
  }
};

setupAdmin();