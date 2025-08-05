import mongoose from 'mongoose';

const sachSchema = new mongoose.Schema({
  MaSach: {
    type: String,
    required: [true, 'Mã sách là bắt buộc'],
    unique: true,
    trim: true,
    match: [/^S\d{3,}$/, 'Mã sách phải có định dạng S001, S002, ...']
  },
  TenSach: {
    type: String,
    required: [true, 'Tên sách là bắt buộc'],
    trim: true,
    maxLength: [200, 'Tên sách không được quá 200 ký tự']
  },
  DonGia: {
    type: Number,
    required: [true, 'Đơn giá là bắt buộc'],
    min: [0, 'Đơn giá phải lớn hơn 0'],
    max: [10000000, 'Đơn giá không được quá 10,000,000 VNĐ']
  },
  SoQuyen: {
    type: Number,
    required: [true, 'Số quyển là bắt buộc'],
    min: [0, 'Số quyển phải lớn hơn hoặc bằng 0'],
    max: [1000, 'Số quyển không được quá 1000']
  },
  NamXuatBan: {
    type: Number,
    required: [true, 'Năm xuất bản là bắt buộc'],
    min: [1900, 'Năm xuất bản phải từ 1900'],
    max: [new Date().getFullYear(), `Năm xuất bản không được quá ${new Date().getFullYear()}`]
  },
  MaNhaXuatBan: {
    type: String,
    required: [true, 'Mã nhà xuất bản là bắt buộc'],
    ref: 'NhaXuatBan'
  },
  NhaXuatBan: {
    type: String,
    required: [true, 'Tên nhà xuất bản là bắt buộc'],
    trim: true
  },
  NguonGoc: {
    type: String,
    required: [true, 'Tác giả là bắt buộc'],
    trim: true,
    maxLength: [100, 'Tên tác giả không được quá 100 ký tự']
  }
}, {
  timestamps: true,
  collection: 'sach'
});

// Indexes disabled for faster startup - will add back later if needed

// Virtual for availability status
sachSchema.virtual('TrangThai').get(function() {
  return this.SoQuyen > 0 ? 'Còn hàng' : 'Hết hàng';
});

// Static method for search
sachSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query.trim(), 'i');
  return this.find({
    $or: [
      { MaSach: searchRegex },
      { TenSach: searchRegex },
      { NguonGoc: searchRegex },
      { NhaXuatBan: searchRegex }
    ]
  });
};

// Method to check if book is available for borrowing
sachSchema.methods.isAvailable = function() {
  return this.SoQuyen > 0;
};

// Method to borrow book (decrease quantity)
sachSchema.methods.borrow = function() {
  if (this.SoQuyen > 0) {
    this.SoQuyen -= 1;
    return this.save();
  }
  throw new Error('Sách đã hết');
};

// Method to return book (increase quantity)
sachSchema.methods.returnBook = function() {
  this.SoQuyen += 1;
  return this.save();
};

export default mongoose.model('Sach', sachSchema);