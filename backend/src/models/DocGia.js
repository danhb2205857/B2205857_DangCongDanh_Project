import mongoose from 'mongoose';

const docGiaSchema = new mongoose.Schema({
  MaDocGia: {
    type: String,
    required: [true, 'Mã độc giả là bắt buộc'],
    unique: true,
    trim: true,
    match: [/^DG\d{3,}$/, 'Mã độc giả phải có định dạng DG001, DG002, ...']
  },
  HoLot: {
    type: String,
    required: [true, 'Họ lót là bắt buộc'],
    trim: true,
    maxLength: [50, 'Họ lót không được quá 50 ký tự']
  },
  Ten: {
    type: String,
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    maxLength: [20, 'Tên không được quá 20 ký tự']
  },
  NgaySinh: {
    type: Date,
    required: [true, 'Ngày sinh là bắt buộc'],
    validate: {
      validator: function(value) {
        const today = new Date();
        const age = today.getFullYear() - value.getFullYear();
        return age >= 5 && age <= 100;
      },
      message: 'Tuổi phải từ 5 đến 100'
    }
  },
  Phai: {
    type: String,
    required: [true, 'Phái là bắt buộc'],
    enum: {
      values: ['Nam', 'Nữ'],
      message: 'Phái phải là Nam hoặc Nữ'
    }
  },
  DiaChi: {
    type: String,
    required: [true, 'Địa chỉ là bắt buộc'],
    trim: true,
    maxLength: [200, 'Địa chỉ không được quá 200 ký tự']
  },
  DienThoai: {
    type: String,
    required: [true, 'Điện thoại là bắt buộc'],
    unique: true,
    trim: true,
    match: [/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ']
  }
}, {
  timestamps: true,
  collection: 'docgia'
});

// Indexes disabled for faster startup - will add back later if needed

// Virtual for full name
docGiaSchema.virtual('HoTenDayDu').get(function() {
  return `${this.HoLot} ${this.Ten}`;
});

// Static method for search
docGiaSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query.trim(), 'i');
  return this.find({
    $or: [
      { MaDocGia: searchRegex },
      { HoLot: searchRegex },
      { Ten: searchRegex },
      { DiaChi: searchRegex },
      { DienThoai: searchRegex }
    ]
  });
};

export default mongoose.model('DocGia', docGiaSchema);