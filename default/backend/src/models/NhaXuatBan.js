import mongoose from 'mongoose';

const NhaXuatBanSchema = new mongoose.Schema({
  MaNXB: { type: String, required: true, unique: true },
  TenNXB: { type: String, required: true },
  DiaChi: { type: String, required: true }
});

export default mongoose.model('NhaXuatBan', NhaXuatBanSchema);
