import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NhanVien } from '../src/models/index.js';


dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quanlythuvien');
    console.log('Connected to MongoDB');

    const existingAdmin = await NhanVien.findOne({ MSNV: 'NV001' });
    if (existingAdmin) {
      console.log('Admin account already exists:', existingAdmin.MSNV);
      
      existingAdmin.Quyen = ["doc_gia", "sach", "nha_xuat_ban", "muon_tra", "thong_ke", "quan_ly"];
      existingAdmin.isActivate = 1;
      existingAdmin.ChucVu = "Quản lý thư viện";
      await existingAdmin.save();
      
      console.log('Admin account updated with full permissions');
      process.exit(0);
    }

    const adminData = {
      MSNV: 'NV001',
      HoTenNV: 'Quản trị viên hệ thống',
      Password: 'admin123',
      ChucVu: 'Quản lý thư viện',
      DiaChi: '123 Đường Nguyễn Văn Cừ, Quận 5, TP.HCM',
      SoDienThoai: '0901234567',
      Email: 'admin@thuvien.com',
      NgaySinh: new Date('1990-01-01'),
      NgayVaoLam: new Date(),
      TrangThai: 'Đang làm việc',
      Quyen: ["doc_gia", "sach", "nha_xuat_ban", "muon_tra", "thong_ke", "quan_ly"],
      isActivate: 1
    };

    const admin = new NhanVien(adminData);
    await admin.save();

    console.log('✅ Admin account created successfully!');
    console.log('📋 Login credentials:');
    console.log('   Username: NV001');
    console.log('   Password: admin123');
    console.log('   Role: Quản lý thư viện');
    console.log('   Permissions: All permissions');
    console.log('   Status: Activated');

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

createAdmin();