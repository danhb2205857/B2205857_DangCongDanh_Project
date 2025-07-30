import mongoose from 'mongoose';

const TheoDoiMuonSachSchema = new mongoose.Schema({
  MaDocGia: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'DocGia',
    required: [true, 'Mã độc giả là bắt buộc']
  },
  MaSach: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Sach',
    required: [true, 'Mã sách là bắt buộc']
  },
  NgayMuon: { 
    type: Date, 
    required: [true, 'Ngày mượn là bắt buộc'],
    default: Date.now,
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Ngày mượn không được là ngày tương lai'
    }
  },
  NgayTra: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= this.NgayMuon;
      },
      message: 'Ngày trả phải sau ngày mượn'
    }
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
  TrangThai: {
    type: String,
    enum: {
      values: ['muon', 'tra', 'qua_han'],
      message: 'Trạng thái không hợp lệ'
    },
    default: 'muon'
  },
  GhiChu: {
    type: String,
    trim: true,
    maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự']
  },
  NhanVienMuon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanVien',
    required: [true, 'Nhân viên xử lý mượn là bắt buộc']
  },
  NhanVienTra: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NhanVien'
  }
}, {
  timestamps: true,
  collection: 'theodoimuonsachs'
});

// Compound indexes
TheoDoiMuonSachSchema.index({ MaDocGia: 1, MaSach: 1 });
TheoDoiMuonSachSchema.index({ NgayMuon: 1 });
TheoDoiMuonSachSchema.index({ NgayTra: 1 });
TheoDoiMuonSachSchema.index({ TrangThai: 1 });
TheoDoiMuonSachSchema.index({ NgayHenTra: 1 });

// Virtual for loan duration
TheoDoiMuonSachSchema.virtual('SoNgayMuon').get(function() {
  const endDate = this.NgayTra || new Date();
  const startDate = this.NgayMuon;
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
TheoDoiMuonSachSchema.virtual('QuaHan').get(function() {
  if (this.TrangThai === 'tra') return false;
  return new Date() > this.NgayHenTra;
});

// Virtual for days overdue
TheoDoiMuonSachSchema.virtual('SoNgayQuaHan').get(function() {
  if (!this.QuaHan) return 0;
  const today = new Date();
  const diffTime = today - this.NgayHenTra;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
TheoDoiMuonSachSchema.set('toJSON', { virtuals: true });
TheoDoiMuonSachSchema.set('toObject', { virtuals: true });

// Pre-save middleware
TheoDoiMuonSachSchema.pre('save', function(next) {
  // Auto-set NgayHenTra if not provided (default 14 days)
  if (!this.NgayHenTra && this.NgayMuon) {
    this.NgayHenTra = new Date(this.NgayMuon.getTime() + (14 * 24 * 60 * 60 * 1000));
  }
  
  // Auto-update status based on dates
  if (this.NgayTra) {
    this.TrangThai = 'tra';
  } else if (new Date() > this.NgayHenTra) {
    this.TrangThai = 'qua_han';
  } else {
    this.TrangThai = 'muon';
  }
  
  next();
});

// Static method to find overdue books
TheoDoiMuonSachSchema.statics.findOverdue = function() {
  return this.find({
    TrangThai: { $in: ['muon', 'qua_han'] },
    NgayHenTra: { $lt: new Date() }
  }).populate('MaDocGia MaSach');
};

// Static method to find books borrowed by reader
TheoDoiMuonSachSchema.statics.findByReader = function(docGiaId) {
  return this.find({ MaDocGia: docGiaId })
    .populate('MaSach')
    .sort({ NgayMuon: -1 });
};

// Instance method to return book
TheoDoiMuonSachSchema.methods.returnBook = function(nhanVienId) {
  this.NgayTra = new Date();
  this.TrangThai = 'tra';
  this.NhanVienTra = nhanVienId;
  return this.save();
};

export default mongoose.model('TheoDoiMuonSach', TheoDoiMuonSachSchema);
