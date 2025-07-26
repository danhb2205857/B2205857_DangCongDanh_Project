import mongoose from 'mongoose';

const AuthSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  linkedId: { type: mongoose.Schema.Types.ObjectId, refPath: 'role', required: false }, // Li?n k?t t?i NhanVien ho?c DocGia
});

export default mongoose.model('Auth', AuthSchema);
