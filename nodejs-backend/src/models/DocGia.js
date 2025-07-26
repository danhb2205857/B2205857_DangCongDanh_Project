import mongoose from 'mongoose';

const DocGiaSchema = new mongoose.Schema({
  MaDocGia: { 
    type: String, 
    required: [true, 'Mã độc giả là bắt buộc'], 
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^DG\d{3,}$/, 'Mã độc giả phải có định dạng DG001, DG002, ...']
  },
  HoLot: { 
    type: String, 
    required: [true, 'Họ lót là bắt buộc'],
    trim: true,
    maxlength: [50, 'Họ lót không được vượt quá 50 ký tự']
  },
  Ten: { 
    type: String, 
    required: [true, 'Tên là bắt buộc'],
    trim: true,
    maxlength: [30, 'Tên không được vượt quá 30 ký tự']
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
    enum: {
      values: ['Nam', 'Nữ'],
      message: 'Phái chỉ có thể là Nam hoặc Nữ'
    },
    required: [true, 'Phái là bắt buộc']
  },
  DiaChi: { 
    type: String, 
    required: [true, 'Địa chỉ là bắt buộc'],
    trim: true,
    maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự']
  },
  DienThoai: { 
    type: String, 
    required: [true, 'Điện thoại là bắt buộc'],
    trim: true,
    match: [/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ']
  }
}, {
  timestamps: true,
  collection: 'docgias'
});

// Indexes for better performance (MaDocGia unique index is auto-created)
DocGiaSchema.index({ HoLot: 'text', Ten: 'text', DiaChi: 'text' });
DocGiaSchema.index({ DienThoai: 1 });

// Virtual for full name
DocGiaSchema.virtual('HoTen').get(function() {
  return `${this.HoLot} ${this.Ten}`;
});

// Virtual for age
DocGiaSchema.virtual('Tuoi').get(function() {
  const today = new Date();
  const birthDate = new Date(this.NgaySinh);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Ensure virtual fields are serialized
DocGiaSchema.set('toJSON', { virtuals: true });
DocGiaSchema.set('toObject', { virtuals: true });

// Pre-save middleware
DocGiaSchema.pre('save', function(next) {
  // Capitalize names
  if (this.HoLot) {
    this.HoLot = this.HoLot.replace(/\b\w/g, l => l.toUpperCase());
  }
  if (this.Ten) {
    this.Ten = this.Ten.replace(/\b\w/g, l => l.toUpperCase());
  }
  next();
});

export default mongoose.model('DocGia', DocGiaSchema);
