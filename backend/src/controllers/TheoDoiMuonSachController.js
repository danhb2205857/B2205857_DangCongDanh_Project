import TheoDoiMuonSach from "../models/TheoDoiMuonSach.js";
import DocGia from "../models/DocGia.js";
import Sach from "../models/Sach.js";
import NhanVien from "../models/NhanVien.js";
import { AppError } from "../middlewares/errorHandler.js";


function buildSearchQuery(search) {
  console.log("Building TheoDoiMuonSach search query for:", search);


  if (!search || typeof search !== "string" || search.trim().length === 0) {
    console.log("No valid search term, returning empty query");
    return {};
  }


  const searchTerm = search.trim();


  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");


  const searchRegex = new RegExp(escapedSearchTerm, "i");

  const query = {
    $or: [
      { MaTheoDoiMuonSach: searchRegex },
      { MaDocGia: searchRegex },
      { MaSach: searchRegex },
    ],
  };

  console.log("TheoDoiMuonSach search query created successfully");
  return query;
}

// Helper function to generate next MaTheoDoiMuonSach
async function generateNextId() {
  console.log("Generating next MaTheoDoiMuonSach...");

  const lastRecord = await TheoDoiMuonSach.findOne()
    .sort({ MaTheoDoiMuonSach: -1 })
    .select("MaTheoDoiMuonSach")
    .lean();

  if (!lastRecord) {
    console.log("No previous record found, returning TD001");
    return "TD001";
  }

  const lastNumber = parseInt(lastRecord.MaTheoDoiMuonSach.substring(2));
  const nextNumber = lastNumber + 1;
  const nextId = `TD${nextNumber.toString().padStart(3, "0")}`;

  console.log("Generated next ID:", nextId);
  return nextId;
}

export default {
  
  async getAll(req, res) {
    console.log("=== Starting TheoDoiMuonSach getAll function ===");

    
    try {
      await TheoDoiMuonSach.updateOverdueBooks();
      console.log("✅ Updated overdue books status and penalties");
    } catch (error) {
      console.error("⚠️ Error updating overdue books:", error);
    }

    
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || "";
    const status = req.query.status || "";
    const sortBy = req.query.sortBy || "NgayMuon";
    const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

    console.log("Query params:", {
      page,
      limit,
      search,
      status,
      sortBy,
      sortOrder,
    });

    
    const searchQuery = buildSearchQuery(search);
    if (status) {
      searchQuery.TrangThai = status;
    }
    
    
    const includeInactive = req.query.includeInactive === 'true';
    const onlyPending = req.query.onlyPending === 'true';
    
    if (onlyPending) {
      searchQuery.isActivate = 0; 
    } else if (!includeInactive) {
      searchQuery.isActivate = 1; 
    }
    
    
    console.log("Search query built:", JSON.stringify(searchQuery));

    
    console.log("Getting total count...");
    const total = await TheoDoiMuonSach.countDocuments(searchQuery);
    console.log("Total TheoDoiMuonSach documents found:", total);

    
    console.log("Building main query...");
    const skip = (page - 1) * limit;
    let query = TheoDoiMuonSach.find(searchQuery);
    
    query = query.skip(skip);
    query = query.limit(limit);

    
    const validSortFields = [
      "MaTheoDoiMuonSach",
      "MaDocGia",
      "MaSach",
      "NgayMuon",
      "NgayHenTra",
      "TrangThai",
    ];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : "NgayMuon";
    query = query.sort({ [finalSortBy]: sortOrder });

    console.log("Query configured with:", {
      skip,
      limit,
      sort: { [finalSortBy]: sortOrder },
    });

    
    console.log("Executing TheoDoiMuonSach query...");
    const data = await query.lean();
    console.log(
      "Query executed successfully, got",
      data.length,
      "TheoDoiMuonSach items"
    );

    
    const totalPages = Math.ceil(total / limit);
    const paginationInfo = {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    console.log("Pagination info:", paginationInfo);

    
    res.json({
      success: true,
      message: "Lấy danh sách theo dõi mượn sách thành công",
      data: data,
      pagination: paginationInfo,
    });

    console.log(
      "=== TheoDoiMuonSach getAll function completed successfully ==="
    );
  },

  
  async getById(req, res) {
    console.log("Getting TheoDoiMuonSach by ID:", req.params.id);

    let query = TheoDoiMuonSach.findOne({ MaTheoDoiMuonSach: req.params.id });
    query = query.populate("MaDocGia", "HoLot Ten DienThoai");
    query = query.populate("MaSach", "TenSach NguonGoc SoQuyen");
    query = query.populate("NhanVienMuon", "HoTenNV");
    query = query.populate("NhanVienTra", "HoTenNV");

    const theoDoiMuonSach = await query.lean();

    if (!theoDoiMuonSach) {
      throw new AppError(
        "Không tìm thấy bản ghi theo dõi mượn sách",
        404,
        "THEODOIMUONSACH_NOT_FOUND"
      );
    }

    res.json({
      success: true,
      message: "Lấy thông tin theo dõi mượn sách thành công",
      data: theoDoiMuonSach,
    });
  },

  
  async borrowBook(req, res) {
    console.log("Creating new borrow record:", req.body);

    const { MaDocGia, MaSach, NgayHenTra, GhiChu, NhanVienMuon } = req.body;

    
    if (!MaDocGia || !MaSach || !NgayHenTra || !NhanVienMuon) {
      throw new AppError(
        "Thiếu thông tin bắt buộc",
        400,
        "MISSING_REQUIRED_FIELDS"
      );
    }

    
    console.log("Checking if reader exists:", MaDocGia);
    const docGia = await DocGia.findOne({ MaDocGia }).lean();
    if (!docGia) {
      throw new AppError("Không tìm thấy độc giả", 404, "DOCGIA_NOT_FOUND");
    }

    
    console.log("Checking if book exists:", MaSach);
    const sach = await Sach.findOne({ MaSach }).lean();
    if (!sach) {
      throw new AppError("Không tìm thấy sách", 404, "SACH_NOT_FOUND");
    }

    const soQuyenConLai =
      sach.SoQuyenConLai !== undefined ? sach.SoQuyenConLai : sach.SoQuyen;
    if (soQuyenConLai <= 0) {
      throw new AppError("Sách đã hết", 400, "BOOK_OUT_OF_STOCK");
    }

    
    console.log("Checking existing borrow record...");
    const existingBorrow = await TheoDoiMuonSach.findOne({
      MaDocGia,
      MaSach,
      TrangThai: { $ne: "Đã trả" },
    }).lean();

    if (existingBorrow) {
      throw new AppError(
        "Độc giả đã mượn sách này và chưa trả",
        400,
        "ALREADY_BORROWED"
      );
    }

    
    const MaTheoDoiMuonSach = await generateNextId();

    
    console.log("Creating new TheoDoiMuonSach record...");
    const theoDoiMuonSach = new TheoDoiMuonSach({
      MaTheoDoiMuonSach,
      MaDocGia,
      MaSach,
      NgayMuon: new Date(),
      NgayHenTra: new Date(NgayHenTra),
      GhiChu: GhiChu || "",
      NhanVienMuon,
    });

    await theoDoiMuonSach.save();
    console.log("Borrow record saved successfully");

    
    console.log("Decreasing book available quantity...");
    await Sach.findOneAndUpdate({ MaSach }, { $inc: { SoQuyenConLai: -1 } });
    console.log("Book available quantity updated");

    
    console.log("Returning saved record...");
    const savedRecord = await TheoDoiMuonSach.findById(
      theoDoiMuonSach._id
    ).lean();

    res.status(201).json({
      success: true,
      message: "Mượn sách thành công",
      data: savedRecord,
    });

    console.log("Borrow book operation completed successfully");
  },

  
  async returnBook(req, res) {
    console.log("Processing book return for ID:", req.params.id);

    const { GhiChu, NhanVienTra } = req.body;

    if (!NhanVienTra) {
      throw new AppError(
        "Thiếu thông tin nhân viên xử lý trả sách",
        400,
        "MISSING_NHANVIEN_TRA"
      );
    }

    const theoDoiMuonSach = await TheoDoiMuonSach.findOne({
      MaTheoDoiMuonSach: req.params.id,
    });

    if (!theoDoiMuonSach) {
      throw new AppError(
        "Không tìm thấy bản ghi mượn sách",
        404,
        "THEODOIMUONSACH_NOT_FOUND"
      );
    }

    if (theoDoiMuonSach.TrangThai === "Đã trả") {
      throw new AppError("Sách đã được trả", 400, "ALREADY_RETURNED");
    }

    
    console.log("Updating return information...");
    theoDoiMuonSach.NgayTra = new Date();
    theoDoiMuonSach.TrangThai = "Đã trả";
    theoDoiMuonSach.NhanVienTra = NhanVienTra;
    if (GhiChu) {
      theoDoiMuonSach.GhiChu = GhiChu;
    }

    await theoDoiMuonSach.save();
    console.log("Return record updated successfully");

    
    console.log("Increasing book available quantity...");
    await Sach.findOneAndUpdate(
      { MaSach: theoDoiMuonSach.MaSach },
      { $inc: { SoQuyenConLai: 1 } }
    );
    console.log("Book available quantity updated");


    console.log("Returning updated record...");
    const updatedRecord = await TheoDoiMuonSach.findById(
      theoDoiMuonSach._id
    ).lean();

    res.json({
      success: true,
      message: "Trả sách thành công",
      data: updatedRecord,
    });

    console.log("Return book operation completed successfully");
  },

  
  async extendDueDate(req, res) {
    console.log("Processing due date extension for ID:", req.params.id);

    const { NgayHenTra, GhiChu } = req.body;

    if (!NgayHenTra) {
      throw new AppError("Thiếu ngày hẹn trả mới", 400, "MISSING_NGAY_HEN_TRA");
    }

    const newDueDate = new Date(NgayHenTra);
    if (newDueDate <= new Date()) {
      throw new AppError(
        "Ngày hẹn trả mới phải sau ngày hiện tại",
        400,
        "INVALID_DUE_DATE"
      );
    }

    const theoDoiMuonSach = await TheoDoiMuonSach.findOne({
      MaTheoDoiMuonSach: req.params.id,
    });

    if (!theoDoiMuonSach) {
      throw new AppError(
        "Không tìm thấy bản ghi mượn sách",
        404,
        "THEODOIMUONSACH_NOT_FOUND"
      );
    }

    if (theoDoiMuonSach.TrangThai === "Đã trả") {
      throw new AppError(
        "Không thể gia hạn sách đã trả",
        400,
        "BOOK_ALREADY_RETURNED"
      );
    }

    
    console.log("Updating due date...");
    theoDoiMuonSach.NgayHenTra = newDueDate;
    if (GhiChu) {
      theoDoiMuonSach.GhiChu = GhiChu;
    }

    await theoDoiMuonSach.save();
    console.log("Due date updated successfully");

    
    console.log("Returning updated record...");
    const updatedRecord = await TheoDoiMuonSach.findById(
      theoDoiMuonSach._id
    ).lean();

    res.json({
      success: true,
      message: "Gia hạn sách thành công",
      data: updatedRecord,
    });

    console.log("Extend due date operation completed successfully");
  },

  
  async getOverdue(req, res) {
    console.log("Getting overdue books...");

    let query = TheoDoiMuonSach.find({
      TrangThai: { $ne: "Đã trả" },
      NgayHenTra: { $lt: new Date() },
    });

    query = query.populate("MaDocGia", "HoLot Ten DienThoai");
    query = query.populate("MaSach", "TenSach NguonGoc");
    query = query.populate("NhanVienMuon", "HoTenNV");
    query = query.sort({ NgayHenTra: 1 });

    const overdueBooks = await query.lean();
    console.log("Found", overdueBooks.length, "overdue books");

    res.json({
      success: true,
      message: "Lấy danh sách sách quá hạn thành công",
      data: overdueBooks,
    });

    console.log("Get overdue books operation completed successfully");
  },

  
  async getByReader(req, res) {
    console.log("Getting borrow history for reader:", req.params.maDocGia);

    try {
      let query = TheoDoiMuonSach.find({ MaDocGia: req.params.maDocGia });
      query = query.sort({ NgayMuon: -1 });

      const history = await query.lean();

      const maSachList = [...new Set(history.map((record) => record.MaSach))];

      const sachData = await Sach.find({ MaSach: { $in: maSachList } })
        .select("MaSach TenSach NguonGoc")
        .lean();

      const sachMap = sachData.reduce((map, sach) => {
        map[sach.MaSach] = { TenSach: sach.TenSach, NguonGoc: sach.NguonGoc };
        return map;
      }, {});

      const maNhanVienList = [
        ...new Set(
          history.flatMap((record) =>
            [record.NhanVienMuon, record.NhanVienTra].filter(Boolean)
          )
        ),
      ];

      const nhanVienData = await NhanVien.find({
        MSNV: { $in: maNhanVienList },
      })
        .select("MaNhanVien HoTenNV")
        .lean();

      // Tạo map để tra cứu nhanh thông tin nhân viên
      const nhanVienMap = nhanVienData.reduce((map, nv) => {
        map[nv.MaNhanVien] = { HoTenNV: nv.HoTenNV };
        return map;
      }, {});

      // Kết hợp thông tin sách và nhân viên vào history
      const enrichedHistory = history.map((record) => ({
        ...record,
        MaSach: {
          MaSach: record.MaSach,
          TenSach: sachMap[record.MaSach]?.TenSach || "Không tìm thấy sách",
          NguonGoc:
            sachMap[record.MaSach]?.NguonGoc || "Không tìm thấy nguồn gốc",
        },
        NhanVienMuon: record.NhanVienMuon
          ? {
              MaNhanVien: record.NhanVienMuon,
              HoTenNV:
                nhanVienMap[record.NhanVienMuon]?.HoTenNV ||
                "Không tìm thấy nhân viên",
            }
          : null,
        NhanVienTra: record.NhanVienTra
          ? {
              MaNhanVien: record.NhanVienTra,
              HoTenNV:
                nhanVienMap[record.NhanVienTra]?.HoTenNV ||
                "Không tìm thấy nhân viên",
            }
          : null,
      }));

      console.log("Found", enrichedHistory.length, "borrow records for reader");

      res.json({
        success: true,
        message: "Lấy lịch sử mượn sách thành công",
        data: enrichedHistory,
      });

      console.log("Get reader borrow history operation completed successfully");
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({
        success: false,
        message: "Lỗi server: " + error.message,
      });
    }
  },

  
  async getByBook(req, res) {
    console.log("Getting borrow history for book:", req.params.maSach);

    let query = TheoDoiMuonSach.find({ MaSach: req.params.maSach });
    query = query.populate("MaDocGia", "HoLot Ten DienThoai");
    query = query.populate("NhanVienMuon", "HoTenNV");
    query = query.populate("NhanVienTra", "HoTenNV");
    query = query.sort({ NgayMuon: -1 });

    const history = await query.lean();
    console.log("Found", history.length, "borrow records for book");

    res.json({
      success: true,
      message: "Lấy lịch sử mượn sách thành công",
      data: history,
    });

    console.log("Get book borrow history operation completed successfully");
  },

  
  async updateOverdue(req, res) {
    console.log('Manually updating overdue books...');
    
    try {
      const result = await TheoDoiMuonSach.updateOverdueBooks();
      
      res.json({
        success: true,
        message: 'Cập nhật sách quá hạn thành công',
        data: {
          updatedCount: result.updatedCount,
          totalOverdue: result.overdueBooks
        }
      });
      
    } catch (error) {
      console.error('Error updating overdue books:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi cập nhật sách quá hạn',
        error: 'UPDATE_OVERDUE_ERROR'
      });
    }
  },

  
  async testOverdue(req, res) {
    console.log('Testing overdue system...');
    
    try {
      // Get current overdue books
      const overdueBooks = await TheoDoiMuonSach.find({
        TrangThai: 'Quá hạn'
      }).populate('MaDocGia', 'HoTen').populate('MaSach', 'TenSach');

      // Get books with penalties
      const booksWithPenalties = await TheoDoiMuonSach.find({
        PhiPhat: { $gt: 0 }
      }).populate('MaDocGia', 'HoTen').populate('MaSach', 'TenSach');

      // Update overdue books
      const updateResult = await TheoDoiMuonSach.updateOverdueBooks();

      res.json({
        success: true,
        message: 'Test hệ thống quá hạn thành công',
        data: {
          currentOverdueBooks: overdueBooks.length,
          booksWithPenalties: booksWithPenalties.length,
          updateResult: {
            updatedCount: updateResult.updatedCount,
            totalOverdue: updateResult.overdueBooks
          },
          overdueDetails: overdueBooks.map(book => ({
            id: book.MaTheoDoiMuonSach,
            book: book.MaSach?.TenSach || 'N/A',
            reader: book.MaDocGia?.HoTen || 'N/A',
            dueDate: book.NgayHenTra,
            penalty: book.PhiPhat || 0,
            status: book.TrangThai
          })),
          penaltyDetails: booksWithPenalties.map(book => ({
            id: book.MaTheoDoiMuonSach,
            book: book.MaSach?.TenSach || 'N/A',
            reader: book.MaDocGia?.HoTen || 'N/A',
            penalty: book.PhiPhat,
            overdueDays: Math.max(0, Math.ceil((new Date() - new Date(book.NgayHenTra)) / (1000 * 60 * 60 * 24)))
          }))
        }
      });
      
    } catch (error) {
      console.error('Error testing overdue system:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi test quá hạn',
        error: 'TEST_OVERDUE_ERROR'
      });
    }
  },

  
  async registerBorrow(req, res) {
    console.log('Reader registering borrow request:', req.body);

    const { MaDocGia, MaSach, NgayHenTra, GhiChu } = req.body;

    
    if (!MaDocGia || !MaSach || !NgayHenTra) {
      throw new AppError(
        'Thiếu thông tin bắt buộc',
        400,
        'MISSING_REQUIRED_FIELDS'
      );
    }


    console.log('Checking if reader exists:', MaDocGia);
    const docGia = await DocGia.findOne({ MaDocGia }).lean();
    if (!docGia) {
      throw new AppError('Không tìm thấy độc giả', 404, 'DOCGIA_NOT_FOUND');
    }

    
    console.log('Checking if book exists:', MaSach);
    const sach = await Sach.findOne({ MaSach }).lean();
    if (!sach) {
      throw new AppError('Không tìm thấy sách', 404, 'SACH_NOT_FOUND');
    }

    const soQuyenConLai =
      sach.SoQuyenConLai !== undefined ? sach.SoQuyenConLai : sach.SoQuyen;
    if (soQuyenConLai <= 0) {
      throw new AppError('Sách đã hết', 400, 'BOOK_OUT_OF_STOCK');
    }

    
    console.log('Checking existing borrow record...');
    const existingBorrow = await TheoDoiMuonSach.findOne({
      MaDocGia,
      MaSach,
      TrangThai: { $ne: 'Đã trả' },
    }).lean();

    if (existingBorrow) {
      if (existingBorrow.isActivate === 0) {
        throw new AppError(
          'Bạn đã có đăng ký mượn sách này đang chờ duyệt',
          400,
          'PENDING_REQUEST_EXISTS'
        );
      } else {
        throw new AppError(
          'Bạn đã mượn sách này và chưa trả',
          400,
          'ALREADY_BORROWED'
        );
      }
    }

    
    const dueDate = new Date(NgayHenTra);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    if (dueDate <= today) {
      throw new AppError(
        'Ngày hẹn trả phải sau ngày hôm nay',
        400,
        'INVALID_DUE_DATE'
      );
    }

    if (dueDate > maxDate) {
      throw new AppError(
        'Thời gian mượn tối đa 30 ngày',
        400,
        'EXCEED_MAX_BORROW_PERIOD'
      );
    }

    
    const MaTheoDoiMuonSach = await generateNextId();

    
    console.log('Creating borrow registration...');
    const theoDoiMuonSach = new TheoDoiMuonSach({
      MaTheoDoiMuonSach,
      MaDocGia,
      MaSach,
      NgayMuon: new Date(),
      NgayHenTra: new Date(NgayHenTra),
      GhiChu: GhiChu || 'Đăng ký mượn sách từ độc giả',
      TrangThai: 'Đang mượn',
      isActivate: 0, 
      
    });

    await theoDoiMuonSach.save();
    console.log('Borrow registration saved successfully');

    
    const savedRecord = await TheoDoiMuonSach.findById(
      theoDoiMuonSach._id
    ).lean();

    res.status(201).json({
      success: true,
      message: 'Đăng ký mượn sách thành công. Vui lòng chờ thư viện phê duyệt.',
      data: savedRecord,
    });

    console.log('Borrow registration completed successfully');
  },

  
  async approveRequest(req, res) {
    console.log('Approving borrow request:', req.params.id);

    const theoDoiMuonSach = await TheoDoiMuonSach.findOne({
      MaTheoDoiMuonSach: req.params.id,
    });

    if (!theoDoiMuonSach) {
      throw new AppError(
        'Không tìm thấy phiếu đăng ký',
        404,
        'REQUEST_NOT_FOUND'
      );
    }

    if (theoDoiMuonSach.isActivate === 1) {
      throw new AppError(
        'Phiếu đăng ký đã được duyệt',
        400,
        'ALREADY_APPROVED'
      );
    }

    
    const sach = await Sach.findOne({ MaSach: theoDoiMuonSach.MaSach });
    if (!sach) {
      throw new AppError('Không tìm thấy sách', 404, 'SACH_NOT_FOUND');
    }

    const soQuyenConLai = sach.SoQuyenConLai !== undefined ? sach.SoQuyenConLai : sach.SoQuyen;
    if (soQuyenConLai <= 0) {
      throw new AppError('Sách đã hết, không thể duyệt', 400, 'BOOK_OUT_OF_STOCK');
    }

    
    const currentUser = req.user || { MSNV: 'NV001' }; 

    
    theoDoiMuonSach.isActivate = 1;
    theoDoiMuonSach.NhanVienMuon = currentUser.MSNV || 'NV001';
    theoDoiMuonSach.GhiChu = (theoDoiMuonSach.GhiChu || '') + ' - Đã được duyệt bởi nhân viên';

    await theoDoiMuonSach.save();

    
    await Sach.findOneAndUpdate(
      { MaSach: theoDoiMuonSach.MaSach },
      { $inc: { SoQuyenConLai: -1 } }
    );

    res.json({
      success: true,
      message: 'Duyệt phiếu đăng ký thành công',
      data: theoDoiMuonSach,
    });

    console.log('Request approved successfully');
  },

  
  async rejectRequest(req, res) {
    console.log('Rejecting borrow request:', req.params.id);

    const theoDoiMuonSach = await TheoDoiMuonSach.findOne({
      MaTheoDoiMuonSach: req.params.id,
    });

    if (!theoDoiMuonSach) {
      throw new AppError(
        'Không tìm thấy phiếu đăng ký',
        404,
        'REQUEST_NOT_FOUND'
      );
    }

    if (theoDoiMuonSach.isActivate === 1) {
      throw new AppError(
        'Không thể từ chối phiếu đã được duyệt',
        400,
        'CANNOT_REJECT_APPROVED'
      );
    }

    
    await TheoDoiMuonSach.deleteOne({ MaTheoDoiMuonSach: req.params.id });

    res.json({
      success: true,
      message: 'Từ chối phiếu đăng ký thành công',
    });

    console.log('Request rejected successfully');
  }
};
