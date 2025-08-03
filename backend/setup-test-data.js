/**
 * Setup test data for API testing
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NhanVien from './src/models/NhanVien.js';

dotenv.config();

const setupTestData = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin user exists
    const existingAdmin = await NhanVien.findOne({ MSNV: 'NV001' });
    
    if (!existingAdmin) {
      console.log('👤 Creating admin user...');
      
      const adminUser = new NhanVien({
        MSNV: 'NV001',
        HoTenNV: 'Admin User',
        Password: 'admin123',
        ChucVu: 'Quản lý',
        DiaChi: 'Admin Address',
        SoDienThoai: '0123456789',
        Email: 'admin@example.com',
        NgayVaoLam: new Date(),
        TrangThai: 'Đang làm việc',
        Quyen: ['quan_ly', 'doc_gia', 'sach', 'nha_xuat_ban', 'muon_tra', 'thong_ke']
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('🎉 Test data setup completed!');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

setupTestData();