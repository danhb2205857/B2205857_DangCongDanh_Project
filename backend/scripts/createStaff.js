import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NhanVien } from '../src/models/index.js';

dotenv.config();

const staffAccounts = [
  {
    MSNV: 'NV002',
    HoTenNV: 'Nguyễn Văn Thủ thư',
    Password: 'staff123',
    ChucVu: 'Thủ thư',
    DiaChi: '456 Đường Lê Lợi, Quận 1, TP.HCM',
    SoDienThoai: '0907654321',
    Email: 'thuthu@thuvien.com',
    NgaySinh: new Date('1995-05-15'),
    NgayVaoLam: new Date(),
    TrangThai: 'Đang làm việc',
    Quyen: ["doc_gia", "sach", "muon_tra"],
    isActivate: 1
  },
  {
    MSNV: 'NV003',
    HoTenNV: 'Trần Thị Nhân viên',
    Password: 'nhanvien123',
    ChucVu: 'Nhân viên',
    DiaChi: '789 Đường Nguyễn Huệ, Quận 1, TP.HCM',
    SoDienThoai: '0912345678',
    Email: 'nhanvien@thuvien.com',
    NgaySinh: new Date('1992-08-20'),
    NgayVaoLam: new Date(),
    TrangThai: 'Đang làm việc',
    Quyen: ["doc_gia", "sach"],
    isActivate: 1
  },
  {
    MSNV: 'NV004',
    HoTenNV: 'Lê Văn Thực tập sinh',
    Password: 'thuctap123',
    ChucVu: 'Thực tập sinh',
    DiaChi: '321 Đường Võ Văn Tần, Quận 3, TP.HCM',
    SoDienThoai: '0923456789',
    Email: 'thuctap@thuvien.com',
    NgaySinh: new Date('1998-12-10'),
    NgayVaoLam: new Date(),
    TrangThai: 'Đang làm việc',
    Quyen: ["doc_gia"],
    isActivate: 0
  }
];

const createStaff = async () => {
  try {

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quanlythuvien');
    console.log('Connected to MongoDB');

    console.log('🔄 Creating staff accounts...\n');

    for (const staffData of staffAccounts) {
      const existingStaff = await NhanVien.findOne({ MSNV: staffData.MSNV });
      
      if (existingStaff) {
        console.log(`⚠️  Staff account ${staffData.MSNV} already exists`);
        
        existingStaff.isActivate = staffData.isActivate;
        await existingStaff.save();
        
        console.log(`   Updated activation status: ${staffData.isActivate === 1 ? 'Activated' : 'Deactivated'}`);
      } else {
        const staff = new NhanVien(staffData);
        await staff.save();

        console.log(`✅ Staff account ${staffData.MSNV} created successfully!`);
        console.log(`   Name: ${staffData.HoTenNV}`);
        console.log(`   Role: ${staffData.ChucVu}`);
        console.log(`   Username: ${staffData.MSNV}`);
        console.log(`   Password: ${staffData.Password}`);
        console.log(`   Status: ${staffData.isActivate === 1 ? 'Activated' : 'Deactivated'}`);
      }
      console.log('');
    }

    console.log('📋 Summary of all staff accounts:');
    console.log('┌─────────┬─────────────────────┬─────────────────┬──────────────┬────────────┐');
    console.log('│ MSNV    │ Name                │ Role            │ Password     │ Status     │');
    console.log('├─────────┼─────────────────────┼─────────────────┼──────────────┼────────────┤');
    
    for (const staff of staffAccounts) {
      const status = staff.isActivate === 1 ? 'Activated' : 'Deactivated';
      console.log(`│ ${staff.MSNV.padEnd(7)} │ ${staff.HoTenNV.padEnd(19)} │ ${staff.ChucVu.padEnd(15)} │ ${staff.Password.padEnd(12)} │ ${status.padEnd(10)} │`);
    }
    
    console.log('└─────────┴─────────────────────┴─────────────────┴──────────────┴────────────┘');

  } catch (error) {
    console.error('❌ Error creating staff accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

createStaff();