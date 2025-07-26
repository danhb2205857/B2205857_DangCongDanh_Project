import mongoose from 'mongoose';

const NhanVienSchema = new mongoose.Schema({
  MSNV: { type: String, required: true, unique: true },
  HoTenNV: { type: String, required: true },
  Password: { type: String, required: true },
  ChucVu: { type: String, required: true },
  DiaChi: { type: String, required: true },
  SoDienThoai: { type: String, required: true }
});

export default mongoose.model('NhanVien', NhanVienSchema);
