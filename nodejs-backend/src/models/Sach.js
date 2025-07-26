import mongoose from 'mongoose';

const SachSchema = new mongoose.Schema({
  MaSach: { 
    type: String, 
    required: [true, 'Mã sách là bắt buộc'], 
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^S\d{3,}$/, 'Mã sách phải có định dạng S001, S002, ...']
  },
  TenSach: { 
    type: String, 
    required: [true, 'Tên sách là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tên sách không được vượt quá 200 ký tự']
  },
  DonGia: { 
    type: Number, 
    required: [true, 'Đơn giá là bắt buộc'],
    min: [0, 'Đơn giá phải lớn hơn hoặc bằng 0'],
    max: [10000000, 'Đơn giá không được vượt quá 10,000,000 VNĐ']
  },
  SoQuyen: { 
    type: Number, 
    required: [true, 'Số quyển là bắt buộc'],
    min: [0, 'Số quyển phải lớn hơn hoặc bằng 0'],
    validate: {
      validator: Number.isInteger,
      message: 'Số quyển phải là số nguyên'
    }
  },
  NamXuatBan: { 
    type: Number, 
    required: [true, 'Năm xuất bản là bắt buộc'],
    min: [1900, 'Năm xuất bản phải từ 1900 trở lên'],
    max: [new Date().getFullYear() + 1, 'Năm xuất bản không được vượt quá năm hiện tại'],
    validate: {
      validator: Number.isInteger,
      message: 'Năm xuất bản phải là số nguyên'
    }
  },
  MaNXB: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'NhaXuatBan',
    required: [true, 'Nhà xuất bản là bắt buộc']
  },
  NguonGoc: { 
    type: String,
    trim: true,
    maxlength: [100, 'Nguồn gốc không được vượt quá 100 ký tự'],
    default: 'Không xác định'
  },
  TacGia: { 
    type: String,
    trim: true,
    maxlength: [100, 'Tác giả không được vượt quá 100 ký tự']
  },
  MoTa: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mô tả không được vượt quá 1000 ký tự']
  },
  TrangThai: {
    type: String,
    enum: {
      values: ['Có sẵn', 'Hết sách', 'Ngừng phát hành'],
      message: 'Trạng thái không hợp lệ'
    },
    default: 'Có sẵn'
  }
}, {
  timestamps: true,
  collection: 'sachs'
});

// Indexes for better performance (MaSach unique index is auto-created)
SachSchema.index({ TenSach: 'text', TacGia: 'text', NguonGoc: 'text' });
SachSchema.index({ MaNXB: 1 });
SachSchema.index({ NamXuatBan: 1 });
SachSchema.index({ TrangThai: 1 });

// Virtual for availability status
SachSchema.virtual('CoSan').get(function() {
  return this.SoQuyen > 0 && this.TrangThai === 'Có sẵn';
});

// Virtual for formatted price
SachSchema.virtual('DonGiaFormatted').get(function() {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(this.DonGia);
});

// Ensure virtual fields are serialized
SachSchema.set('toJSON', { virtuals: true });
SachSchema.set('toObject', { virtuals: true });

// Pre-save middleware
SachSchema.pre('save', function(next) {
  // Capitalize book title
  if (this.TenSach) {
    this.TenSach = this.TenSach.replace(/\b\w/g, l => l.toUpperCase());
  }
  
  // Auto-set status based on quantity
  if (this.SoQuyen === 0) {
    this.TrangThai = 'Hết sách';
  } else if (this.TrangThai === 'Hết sách' && this.SoQuyen > 0) {
    this.TrangThai = 'Có sẵn';
  }
  
  next();
});

// Static method to find available books
SachSchema.statics.findAvailable = function() {
  return this.find({ 
    SoQuyen: { $gt: 0 }, 
    TrangThai: 'Có sẵn' 
  }).populate('MaNXB');
};

export default mongoose.model('Sach', SachSchema);
