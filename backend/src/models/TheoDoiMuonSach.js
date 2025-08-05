import mongoose from 'mongoose';

const theoDoiMuonSachSchema = new mongoose.Schema({
  MaTheoDoiMuonSach: {
    type: String,
    required: [true, 'Mã theo dõi mượn sách là bắt buộc'],
    unique: true,
    trim: true,
    match: [/^TD\d{3,}$/, 'Mã theo dõi phải có định dạng TD001, TD002, ...']
  },
  MaDocGia: {
    type: String,
    required: [true, 'Mã độc giả là bắt buộc'],
    ref: 'DocGia'
  },
  MaSach: {
    type: String,
    required: [true, 'Mã sách là bắt buộc'],
    ref: 'Sach'
  },
  NgayMuon: {
    type: Date,
    required: [true, 'Ngày mượn là bắt buộc'],
    default: Date.now
  },
  NgayHenTra: {
    type: Date,
    required: [true, 'Ngày hẹn trả là bắt buộc'],
    validate: {
      validator: function(value) {
        return value > this.NgayMuon;
      },
      message: 'Ngày hẹn trả phải sau ngày mượn'
    }
  },
  NgayTra: {
    type: Date,
    default: null
  },
  TrangThai: {
    type: String,
    enum: {
      values: ['Đang mượn', 'Đã trả', 'Quá hạn'],
      message: 'Trạng thái phải là Đang mượn, Đã trả hoặc Quá hạn'
    },
    default: 'Đang mượn'
  },
  GhiChu: {
    type: String,
    maxLength: [500, 'Ghi chú không được quá 500 ký tự'],
    trim: true
  },
  NhanVienMuon: {
    type: String,
    required: [true, 'Nhân viên xử lý mượn là bắt buộc'],
    ref: 'NhanVien'
  },
  NhanVienTra: {
    type: String,
    ref: 'NhanVien'
  }
}, {
  timestamps: true,
  collection: 'theodoimuonsach'
});

// Indexes disabled for faster startup - will add back later if needed

// Virtual for overdue status
theoDoiMuonSachSchema.virtual('IsOverdue').get(function() {
  if (this.TrangThai === 'Đã trả') return false;
  return new Date() > this.NgayHenTra;
});

// Virtual for days borrowed
theoDoiMuonSachSchema.virtual('SoNgayMuon').get(function() {
  const endDate = this.NgayTra || new Date();
  const diffTime = Math.abs(endDate - this.NgayMuon);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for days overdue
theoDoiMuonSachSchema.virtual('SoNgayQuaHan').get(function() {
  if (this.TrangThai === 'Đã trả') return 0;
  const today = new Date();
  if (today <= this.NgayHenTra) return 0;
  const diffTime = Math.abs(today - this.NgayHenTra);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update status
theoDoiMuonSachSchema.pre('save', function(next) {
  if (this.NgayTra) {
    this.TrangThai = 'Đã trả';
  } else if (new Date() > this.NgayHenTra) {
    this.TrangThai = 'Quá hạn';
  } else {
    this.TrangThai = 'Đang mượn';
  }
  next();
});

// Static method to find overdue books
theoDoiMuonSachSchema.statics.findOverdue = function() {
  return this.find({
    TrangThai: { $ne: 'Đã trả' },
    NgayHenTra: { $lt: new Date() }
  });
};

// Static method to find books by reader
theoDoiMuonSachSchema.statics.findByReader = function(maDocGia) {
  return this.find({ MaDocGia: maDocGia })
    .populate('MaSach', 'TenSach NguonGoc')
    .sort({ NgayMuon: -1 });
};

// Static method to find books by book ID
theoDoiMuonSachSchema.statics.findByBook = function(maSach) {
  return this.find({ MaSach: maSach })
    .populate('MaDocGia', 'HoLot Ten')
    .sort({ NgayMuon: -1 });
};

// Method to return book
theoDoiMuonSachSchema.methods.returnBook = function(nhanVienTra, ghiChu) {
  this.NgayTra = new Date();
  this.NhanVienTra = nhanVienTra;
  this.TrangThai = 'Đã trả';
  if (ghiChu) this.GhiChu = ghiChu;
  return this.save();
};

// Method to extend due date
theoDoiMuonSachSchema.methods.extendDueDate = function(newDueDate, ghiChu) {
  if (this.TrangThai === 'Đã trả') {
    throw new Error('Không thể gia hạn sách đã trả');
  }
  this.NgayHenTra = newDueDate;
  if (ghiChu) this.GhiChu = ghiChu;
  return this.save();
};

export default mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);