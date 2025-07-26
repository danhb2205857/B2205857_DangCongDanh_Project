import mongoose from 'mongoose';

const NhaXuatBanSchema = new mongoose.Schema({
  MaNXB: { 
    type: String, 
    required: [true, 'Mã nhà xuất bản là bắt buộc'], 
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^NXB\d{3,}$/, 'Mã nhà xuất bản phải có định dạng NXB001, NXB002, ...']
  },
  TenNXB: { 
    type: String, 
    required: [true, 'Tên nhà xuất bản là bắt buộc'],
    trim: true,
    maxlength: [100, 'Tên nhà xuất bản không được vượt quá 100 ký tự']
  },
  DiaChi: { 
    type: String, 
    required: [true, 'Địa chỉ là bắt buộc'],
    trim: true,
    maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự']
  },
  DienThoai: {
    type: String,
    trim: true,
    match: [/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ']
  },
  Email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  Website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Website phải bắt đầu bằng http:// hoặc https://']
  },
  TrangThai: {
    type: String,
    enum: {
      values: ['Hoạt động', 'Tạm dừng', 'Ngừng hợp tác'],
      message: 'Trạng thái không hợp lệ'
    },
    default: 'Hoạt động'
  }
}, {
  timestamps: true,
  collection: 'nhaxuatbans'
});

// Indexes for better performance (MaNXB unique index is auto-created)
NhaXuatBanSchema.index({ TenNXB: 'text' });
NhaXuatBanSchema.index({ TrangThai: 1 });

// Virtual for contact info
NhaXuatBanSchema.virtual('ThongTinLienHe').get(function() {
  const contact = [];
  if (this.DienThoai) contact.push(`Tel: ${this.DienThoai}`);
  if (this.Email) contact.push(`Email: ${this.Email}`);
  if (this.Website) contact.push(`Web: ${this.Website}`);
  return contact.join(' | ');
});

// Ensure virtual fields are serialized
NhaXuatBanSchema.set('toJSON', { virtuals: true });
NhaXuatBanSchema.set('toObject', { virtuals: true });

// Pre-save middleware
NhaXuatBanSchema.pre('save', function(next) {
  // Capitalize publisher name
  if (this.TenNXB) {
    this.TenNXB = this.TenNXB.replace(/\b\w/g, l => l.toUpperCase());
  }
  next();
});

// Static method to find active publishers
NhaXuatBanSchema.statics.findActive = function() {
  return this.find({ TrangThai: 'Hoạt động' });
};

// Instance method to get book count
NhaXuatBanSchema.methods.getBookCount = async function() {
  const Sach = mongoose.model('Sach');
  return await Sach.countDocuments({ MaNXB: this._id });
};

export default mongoose.model('NhaXuatBan', NhaXuatBanSchema);
