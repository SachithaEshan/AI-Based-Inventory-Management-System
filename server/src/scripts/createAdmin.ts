import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../config';
import User from '../modules/user/user.model';
import { UserRole, UserStatus } from '../constant/userRole';

async function createInitialAdmin() {
  try {
    // Connect to MongoDB
    if (!config.database_url) {
      throw new Error('Database URL is not configured');
    }
    await mongoose.connect(config.database_url);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: UserRole.ADMIN });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const adminPassword = 'Admin@123'; // Change this to a secure password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@system.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE
    });

    console.log('Admin user created successfully:');
    console.log('Email:', admin.email);
    console.log('Password:', adminPassword);
    console.log('Please change the password after first login!');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createInitialAdmin(); 