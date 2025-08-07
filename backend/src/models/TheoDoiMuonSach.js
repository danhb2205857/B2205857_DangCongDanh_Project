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
    required: function() {
      return this.isActivate === 1; // Only required when activated
    },
    ref: 'NhanVien'
  },
  NhanVienTra: {
    type: String,
    ref: 'NhanVien'
  },
  PhiPhat: {
    type: Number,
    default: 0,
    min: [0, 'Phí phạt không được âm'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value) || value % 1 === 0;
      },
      message: 'Phí phạt phải là số nguyên'
    }
  },
  isActivate: {
    type: Number,
    enum: {
      values: [0, 1],
      message: 'isActivate phải là 0 (chờ duyệt) hoặc 1 (đã duyệt)'
    },
    default: 1,
    comment: '0: Đăng ký chờ duyệt, 1: Đã được duyệt/Nhân viên tạo'
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
  if (this.TrangThai === 'Đã trả') {
    // Nếu đã trả, tính số ngày quá hạn từ ngày hẹn trả đến ngày trả
    if (this.NgayTra && this.NgayTra > this.NgayHenTra) {
      const diffTime = Math.abs(this.NgayTra - this.NgayHenTra);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  }
  
  const today = new Date();
  if (today <= this.NgayHenTra) return 0;
  const diffTime = Math.abs(today - this.NgayHenTra);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to calculate penalty fee
theoDoiMuonSachSchema.methods.calculatePenaltyFee = function() {
  const overdueDays = this.SoNgayQuaHan;
  return overdueDays * 2000; // 2000 VND per day
};

// Pre-save middleware to update status and penalty fee
theoDoiMuonSachSchema.pre('save', function(next) {
  const today = new Date();
  
  if (this.NgayTra) {
    this.TrangThai = 'Đã trả';
    // Tính phí phạt nếu trả muộn
    if (this.NgayTra > this.NgayHenTra) {
      const overdueDays = Math.ceil((this.NgayTra - this.NgayHenTra) / (1000 * 60 * 60 * 24));
      this.PhiPhat = overdueDays * 2000;
    } else {
      this.PhiPhat = 0;
    }
  } else if (today > this.NgayHenTra) {
    this.TrangThai = 'Quá hạn';
    // Tính phí phạt cho sách chưa trả
    const overdueDays = Math.ceil((today - this.NgayHenTra) / (1000 * 60 * 60 * 24));
    this.PhiPhat = overdueDays * 2000;
  } else {
    this.TrangThai = 'Đang mượn';
    this.PhiPhat = 0;
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

// Static method to update overdue books
theoDoiMuonSachSchema.statics.updateOverdueBooks = async function() {
  const today = new Date();
  
  // Find all books that are not returned and past due date
  const overdueBooks = await this.find({
    TrangThai: { $in: ['Đang mượn', 'Quá hạn'] },
    NgayTra: null,
    NgayHenTra: { $lt: today }
  });

  let updatedCount = 0;
  
  for (const book of overdueBooks) {
    const overdueDays = Math.ceil((today - book.NgayHenTra) / (1000 * 60 * 60 * 24));
    book.TrangThai = 'Quá hạn';
    book.PhiPhat = overdueDays * 2000;
    await book.save();
    updatedCount++;
  }

  return {
    updatedCount,
    overdueBooks: overdueBooks.length
  };
};

export default mongoose.model('TheoDoiMuonSach', theoDoiMuonSachSchema);