import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';
import DocGia from '../models/DocGia.js';
import Sach from '../models/Sach.js';
import { AppError } from '../middlewares/errorHandler.js';

/**
 * TheoDoiMuonSach Controller - Quản lý mượn trả sách
 */

// Helper function to build search query
function buildSearchQuery(search) {
  if (!search) return {};
  
  const searchRegex = new RegExp(search.trim(), 'i');
  return {
    $or: [
      { MaTheoDoiMuonSach: searchRegex },
      { MaDocGia: searchRegex },
      { MaSach: searchRegex }
    ]
  };
}

// Helper function to generate next MaTheoDoiMuonSach
async function generateNextId() {
  const lastRecord = await TheoDoiMuonSach.findOne()
    .sort({ MaTheoDoiMuonSach: -1 })
    .select('MaTheoDoiMuonSach');
  
  if (!lastRecord) {
    return 'TD001';
  }
  
  const lastNumber = parseInt(lastRecord.MaTheoDoiMuonSach.substring(2));
  const nextNumber = lastNumber + 1;
  return `TD${nextNumber.toString().padStart(3, '0')}`;
}

export default {
  /**
   * GET /api/theodoimuonsach - Lấy danh sách theo dõi mượn sách
   */
  async getAll(req, res) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'NgayMuon';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    
    // Build search query
    let searchQuery = buildSearchQuery(search);
    
    // Add status filter
    if (status) {
      searchQuery.TrangThai = status;
    }
    
    // Get total count
    const total = await TheoDoiMuonSach.countDocuments(searchQuery);
    
    // Get data with pagination and populate references
    const data = await TheoDoiMuonSach.find(searchQuery)
      .populate('MaDocGia', 'HoLot Ten DienThoai')
      .populate('MaSach', 'TenSach NguonGoc SoQuyen')
      .populate('NhanVienMuon', 'HoTenNV')
      .populate('NhanVienTra', 'HoTenNV')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ [sortBy]: sortOrder })
      .lean();
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
      success: true,
      message: 'Lấy danh sách theo dõi mượn sách thành công',
      data: {
        theodoimuonsach: data,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage,
          hasPrevPage
        }
      }
    });
  },

  /**
   * GET /api/theodoimuonsach/:id - Lấy thông tin chi tiết
   */
  async getById(req, res) {
    const theoDoiMuonSach = await TheoDoiMuonSach.findOne({ MaTheoDoiMuonSach: req.params.id })
      .populate('MaDocGia')
      .populate('MaSach')
      .populate('NhanVienMuon', 'HoTenNV')
      .populate('NhanVienTra', 'HoTenNV');
    
    if (!theoDoiMuonSach) {
      throw new AppError('Không tìm thấy bản ghi theo dõi mượn sách', 404, 'THEODOIMUONSACH_NOT_FOUND');
    }
    
    res.json({
      success: true,
      message: 'Lấy thông tin theo dõi mượn sách thành công',
      data: theoDoiMuonSach
    });
  },

  /**
   * POST /api/theodoimuonsach/muon - Mượn sách
   */
  async borrowBook(req, res) {
    const { MaDocGia, MaSach, NgayHenTra, GhiChu, NhanVienMuon } = req.body;

    // Validate required fields
    if (!MaDocGia || !MaSach || !NgayHenTra || !NhanVienMuon) {
      throw new AppError('Thiếu thông tin bắt buộc', 400, 'MISSING_REQUIRED_FIELDS');
    }

    // Check if reader exists
    const docGia = await DocGia.findOne({ MaDocGia });
    if (!docGia) {
      throw new AppError('Không tìm thấy độc giả', 404, 'DOCGIA_NOT_FOUND');
    }

    // Check if book exists and available
    const sach = await Sach.findOne({ MaSach });
    if (!sach) {
      throw new AppError('Không tìm thấy sách', 404, 'SACH_NOT_FOUND');
    }

    if (sach.SoQuyen <= 0) {
      throw new AppError('Sách đã hết', 400, 'BOOK_OUT_OF_STOCK');
    }

    // Check if reader already borrowed this book and not returned
    const existingBorrow = await TheoDoiMuonSach.findOne({
      MaDocGia,
      MaSach,
      TrangThai: { $ne: 'Đã trả' }
    });

    if (existingBorrow) {
      throw new AppError('Độc giả đã mượn sách này và chưa trả', 400, 'ALREADY_BORROWED');
    }

    // Generate next ID
    const MaTheoDoiMuonSach = await generateNextId();

    // Create borrow record
    const theoDoiMuonSach = new TheoDoiMuonSach({
      MaTheoDoiMuonSach,
      MaDocGia,
      MaSach,
      NgayMuon: new Date(),
      NgayHenTra: new Date(NgayHenTra),
      GhiChu: GhiChu || '',
      NhanVienMuon
    });

    await theoDoiMuonSach.save();

    // Decrease book quantity
    await Sach.findOneAndUpdate(
      { MaSach },
      { $inc: { SoQuyen: -1 } }
    );

    // Populate and return
    const populatedRecord = await TheoDoiMuonSach.findById(theoDoiMuonSach._id)
      .populate('MaDocGia', 'HoLot Ten')
      .populate('MaSach', 'TenSach NguonGoc')
      .populate('NhanVienMuon', 'HoTenNV');

    res.status(201).json({
      success: true,
      message: 'Mượn sách thành công',
      data: populatedRecord
    });
  },

  /**
   * PUT /api/theodoimuonsach/:id/tra - Trả sách
   */
  async returnBook(req, res) {
    const { GhiChu, NhanVienTra } = req.body;

    if (!NhanVienTra) {
      throw new AppError('Thiếu thông tin nhân viên xử lý trả sách', 400, 'MISSING_NHANVIEN_TRA');
    }

    const theoDoiMuonSach = await TheoDoiMuonSach.findOne({ 
      MaTheoDoiMuonSach: req.params.id 
    });

    if (!theoDoiMuonSach) {
      throw new AppError('Không tìm thấy bản ghi mượn sách', 404, 'THEODOIMUONSACH_NOT_FOUND');
    }

    if (theoDoiMuonSach.TrangThai === 'Đã trả') {
      throw new AppError('Sách đã được trả', 400, 'ALREADY_RETURNED');
    }

    // Update return information
    theoDoiMuonSach.NgayTra = new Date();
    theoDoiMuonSach.TrangThai = 'Đã trả';
    theoDoiMuonSach.NhanVienTra = NhanVienTra;
    if (GhiChu) {
      theoDoiMuonSach.GhiChu = GhiChu;
    }

    await theoDoiMuonSach.save();

    // Increase book quantity
    await Sach.findOneAndUpdate(
      { MaSach: theoDoiMuonSach.MaSach },
      { $inc: { SoQuyen: 1 } }
    );

    // Populate and return
    const populatedRecord = await TheoDoiMuonSach.findById(theoDoiMuonSach._id)
      .populate('MaDocGia', 'HoLot Ten')
      .populate('MaSach', 'TenSach NguonGoc')
      .populate('NhanVienMuon', 'HoTenNV')
      .populate('NhanVienTra', 'HoTenNV');

    res.json({
      success: true,
      message: 'Trả sách thành công',
      data: populatedRecord
    });
  },

  /**
   * PUT /api/theodoimuonsach/:id/giahan - Gia hạn sách
   */
  async extendDueDate(req, res) {
    const { NgayHenTra, GhiChu } = req.body;

    if (!NgayHenTra) {
      throw new AppError('Thiếu ngày hẹn trả mới', 400, 'MISSING_NGAY_HEN_TRA');
    }

    const newDueDate = new Date(NgayHenTra);
    if (newDueDate <= new Date()) {
      throw new AppError('Ngày hẹn trả mới phải sau ngày hiện tại', 400, 'INVALID_DUE_DATE');
    }

    const theoDoiMuonSach = await TheoDoiMuonSach.findOne({ 
      MaTheoDoiMuonSach: req.params.id 
    });

    if (!theoDoiMuonSach) {
      throw new AppError('Không tìm thấy bản ghi mượn sách', 404, 'THEODOIMUONSACH_NOT_FOUND');
    }

    if (theoDoiMuonSach.TrangThai === 'Đã trả') {
      throw new AppError('Không thể gia hạn sách đã trả', 400, 'BOOK_ALREADY_RETURNED');
    }

    // Update due date
    theoDoiMuonSach.NgayHenTra = newDueDate;
    if (GhiChu) {
      theoDoiMuonSach.GhiChu = GhiChu;
    }

    await theoDoiMuonSach.save();

    // Populate and return
    const populatedRecord = await TheoDoiMuonSach.findById(theoDoiMuonSach._id)
      .populate('MaDocGia', 'HoLot Ten')
      .populate('MaSach', 'TenSach NguonGoc')
      .populate('NhanVienMuon', 'HoTenNV');

    res.json({
      success: true,
      message: 'Gia hạn sách thành công',
      data: populatedRecord
    });
  },

  /**
   * GET /api/theodoimuonsach/overdue - Lấy danh sách sách quá hạn
   */
  async getOverdue(req, res) {
    const overdueBooks = await TheoDoiMuonSach.find({
      TrangThai: { $ne: 'Đã trả' },
      NgayHenTra: { $lt: new Date() }
    })
      .populate('MaDocGia', 'HoLot Ten DienThoai')
      .populate('MaSach', 'TenSach NguonGoc')
      .populate('NhanVienMuon', 'HoTenNV')
      .sort({ NgayHenTra: 1 });

    res.json({
      success: true,
      message: 'Lấy danh sách sách quá hạn thành công',
      data: overdueBooks
    });
  },

  /**
   * GET /api/theodoimuonsach/docgia/:maDocGia - Lấy lịch sử mượn của độc giả
   */
  async getByReader(req, res) {
    const history = await TheoDoiMuonSach.find({ MaDocGia: req.params.maDocGia })
      .populate('MaSach', 'TenSach NguonGoc')
      .populate('NhanVienMuon', 'HoTenNV')
      .populate('NhanVienTra', 'HoTenNV')
      .sort({ NgayMuon: -1 });

    res.json({
      success: true,
      message: 'Lấy lịch sử mượn sách thành công',
      data: history
    });
  },

  /**
   * GET /api/theodoimuonsach/sach/:maSach - Lấy lịch sử mượn của sách
   */
  async getByBook(req, res) {
    const history = await TheoDoiMuonSach.find({ MaSach: req.params.maSach })
      .populate('MaDocGia', 'HoLot Ten DienThoai')
      .populate('NhanVienMuon', 'HoTenNV')
      .populate('NhanVienTra', 'HoTenNV')
      .sort({ NgayMuon: -1 });

    res.json({
      success: true,
      message: 'Lấy lịch sử mượn sách thành công',
      data: history
    });
  }
};