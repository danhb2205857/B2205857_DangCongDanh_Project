import mongoose from 'mongoose';

const nhaXuatBanSchema = new mongoose.Schema({
  MaNhaXuatBan: {
    type: String,
    required: [true, 'Mã nhà xuất bản là bắt buộc'],
    unique: true,
    trim: true,
    match: [/^NXB\d{3,}$/, 'Mã nhà xuất bản phải có định dạng NXB001, NXB002, ...']
  },
  TenNhaXuatBan: {
    type: String,
    required: [true, 'Tên nhà xuất bản là bắt buộc'],
    trim: true,
    maxLength: [100, 'Tên nhà xuất bản không được quá 100 ký tự']
  },
  DiaChi: {
    type: String,
    required: [true, 'Địa chỉ là bắt buộc'],
    trim: true,
    maxLength: [200, 'Địa chỉ không được quá 200 ký tự']
  }
}, {
  timestamps: true,
  collection: 'nhaxuatban'
});

// Indexes disabled for faster startup - will add back later if needed

// Virtual for book count
nhaXuatBanSchema.virtual('SoSach', {
  ref: 'Sach',
  localField: 'MaNhaXuatBan',
  foreignField: 'MaNhaXuatBan',
  count: true
});

// Static method for search
nhaXuatBanSchema.statics.search = function(query) {
  const searchRegex = new RegExp(query.trim(), 'i');
  return this.find({
    $or: [
      { MaNhaXuatBan: searchRegex },
      { TenNhaXuatBan: searchRegex },
      { DiaChi: searchRegex }
    ]
  });
};

// Method to get books by this publisher
nhaXuatBanSchema.methods.getBooks = function() {
  return mongoose.model('Sach').find({ MaNhaXuatBan: this.MaNhaXuatBan });
};

// Pre-remove hook to check if publisher has books
nhaXuatBanSchema.pre('findOneAndDelete', async function() {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) {
    const Sach = mongoose.model('Sach');
    const bookCount = await Sach.countDocuments({ MaNhaXuatBan: doc.MaNhaXuatBan });
    if (bookCount > 0) {
      throw new Error(`Không thể xóa nhà xuất bản có ${bookCount} sách`);
    }
  }
});

export default mongoose.model('NhaXuatBan', nhaXuatBanSchema);