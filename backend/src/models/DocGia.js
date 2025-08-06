import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

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
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minLength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false // Không trả về password khi query
  },
  avatar: {
    type: String,
    default: null,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
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

// Hash password before saving
docGiaSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
docGiaSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update last login
docGiaSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Static method for search
docGiaSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query.trim(), 'i');
  return this.find({
    $or: [
      { MaDocGia: searchRegex },
      { HoLot: searchRegex },
      { Ten: searchRegex },
      { DiaChi: searchRegex },
      { DienThoai: searchRegex },
      { email: searchRegex }
    ]
  });
};

// Static method to find by email for login
docGiaSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

export default mongoose.model('DocGia', docGiaSchema);