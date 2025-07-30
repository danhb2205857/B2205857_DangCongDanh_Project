import DocGia from "../models/DocGia.js";

/**
 * DocGia Controller - Quản lý độc giả
 */

// Helper function to build search query
function buildSearchQuery(search) {
  if (!search) return {};

  const searchRegex = new RegExp(search.trim(), "i");
  return {
    $or: [
      { MaDocGia: searchRegex },
      { HoLot: searchRegex },
      { Ten: searchRegex },
      { DiaChi: searchRegex },
      { DienThoai: searchRegex },
    ],
  };
}

export default {
  /**
   * GET /api/docgia - Lấy danh sách độc giả với pagination và search
   */
  async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const search = req.query.search || "";
      const sortBy = req.query.sortBy || "MaDocGia";
      const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;

      // Build search query
      const searchQuery = buildSearchQuery(search);

      // Get total count
      let total = await DocGia.countDocuments(searchQuery);

      // Get data with pagination
      let data = await DocGia.find(searchQuery)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ [sortBy]: sortOrder })
        .lean();

      // If no data found, return mock data for testing
      if (data.length === 0 && total === 0) {
        data = [
          {
            MaDocGia: "DG001",
            HoLot: "Nguyễn Văn",
            Ten: "An",
            NgaySinh: new Date("1990-01-15"),
            Phai: "Nam",
            DiaChi: "123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
            DienThoai: "0901234567",
          },
          {
            MaDocGia: "DG002",
            HoLot: "Trần Thị",
            Ten: "Bình",
            NgaySinh: new Date("1992-05-20"),
            Phai: "Nữ",
            DiaChi: "456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
            DienThoai: "0987654321",
          },
        ];
        total = data.length;
      }

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        message: "Lấy danh sách độc giả thành công",
        data: {
          docgia: data,
          pagination: {
            total,
            totalPages,
            currentPage: page,
            limit,
            hasNextPage,
            hasPrevPage,
          },
        },
      });
    } catch (error) {
      console.error("Get all DocGia error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách độc giả",
        error: "GET_ALL_ERROR",
      });
    }
  },

  /**
   * GET /api/docgia/:id - Lấy thông tin chi tiết độc giả
   */
  async getById(req, res) {
    try {
      const docGia = await DocGia.findOne({ MaDocGia: req.params.id });

      if (!docGia) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy độc giả",
          error: "DOCGIA_NOT_FOUND",
        });
      }

      res.json({
        success: true,
        message: "Lấy thông tin độc giả thành công",
        data: docGia,
      });
    } catch (error) {
      console.error("Get DocGia by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin độc giả",
        error: "GET_BY_ID_ERROR",
      });
    }
  },

  /**
   * POST /api/docgia - Tạo độc giả mới
   */
  async create(req, res) {
    try {
      // Check if MaDocGia already exists
      if (req.body.MaDocGia) {
        const existingDocGia = await DocGia.findOne({
          MaDocGia: req.body.MaDocGia,
        });
        if (existingDocGia) {
          return res.status(400).json({
            success: false,
            message: "Mã độc giả đã tồn tại",
            error: "DUPLICATE_MA_DOCGIA",
          });
        }
      }

      // Check if DienThoai already exists
      if (req.body.DienThoai) {
        const existingPhone = await DocGia.findOne({
          DienThoai: req.body.DienThoai,
        });
        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: "Số điện thoại đã được sử dụng",
            error: "DUPLICATE_PHONE",
          });
        }
      }

      const docGia = new DocGia(req.body);
      await docGia.save();

      res.status(201).json({
        success: true,
        message: "Tạo độc giả mới thành công",
        data: docGia,
      });
    } catch (error) {
      console.error("Create DocGia error:", error);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Dữ liệu đầu vào không hợp lệ",
          errors,
          error: "VALIDATION_ERROR",
        });
      }

      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const fieldName = field === "MaDocGia" ? "Mã độc giả" : "Số điện thoại";
        return res.status(400).json({
          success: false,
          message: `${fieldName} đã tồn tại`,
          error: "DUPLICATE_FIELD",
        });
      }

      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tạo độc giả",
        error: "CREATE_ERROR",
      });
    }
  },

  /**
   * PUT /api/docgia/:id - Cập nhật thông tin độc giả
   */
  async update(req, res) {
    try {
      // Check if trying to update DienThoai to existing value
      if (req.body.DienThoai) {
        const existingPhone = await DocGia.findOne({
          DienThoai: req.body.DienThoai,
          MaDocGia: { $ne: req.params.id },
        });

        if (existingPhone) {
          return res.status(400).json({
            success: false,
            message: "Số điện thoại đã được sử dụng",
            error: "DUPLICATE_PHONE",
          });
        }
      }

      const docGia = await DocGia.findOneAndUpdate(
        { MaDocGia: req.params.id },
        req.body,
        { new: true, runValidators: true }
      );

      if (!docGia) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy độc giả",
          error: "DOCGIA_NOT_FOUND",
        });
      }

      res.json({
        success: true,
        message: "Cập nhật thông tin độc giả thành công",
        data: docGia,
      });
    } catch (error) {
      console.error("Update DocGia error:", error);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Dữ liệu đầu vào không hợp lệ",
          errors,
          error: "VALIDATION_ERROR",
        });
      }

      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi cập nhật độc giả",
        error: "UPDATE_ERROR",
      });
    }
  },

  /**
   * DELETE /api/docgia/:id - Xóa độc giả
   */
  async remove(req, res) {
    try {
      // TODO: Check if reader has borrowed books before deleting
      // const borrowCount = await TheoDoiMuonSach.countDocuments({
      //   MaDocGia: req.params.id,
      //   NgayTra: null
      // });

      // if (borrowCount > 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Không thể xóa độc giả đang mượn sách',
      //     error: 'HAS_BORROWED_BOOKS'
      //   });
      // }

      const docGia = await DocGia.findOneAndDelete({ MaDocGia: req.params.id });

      if (!docGia) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy độc giả",
          error: "DOCGIA_NOT_FOUND",
        });
      }

      res.json({
        success: true,
        message: "Xóa độc giả thành công",
        data: { deletedId: req.params.id },
      });
    } catch (error) {
      console.error("Delete DocGia error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa độc giả",
        error: "DELETE_ERROR",
      });
    }
  },

  /**
   * GET /api/docgia/search/:query - Tìm kiếm độc giả
   */
  async search(req, res) {
    try {
      const query = req.params.query;
      const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));

      const docgia = await DocGia.search(query)
        .limit(limit)
        .select("MaDocGia HoLot Ten DienThoai")
        .lean();

      res.json({
        success: true,
        message: "Tìm kiếm độc giả thành công",
        data: docgia,
      });
    } catch (error) {
      console.error("Search DocGia error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi tìm kiếm độc giả",
        error: "SEARCH_ERROR",
      });
    }
  },
};
