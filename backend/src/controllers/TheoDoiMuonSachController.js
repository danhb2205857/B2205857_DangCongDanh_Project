import { TheoDoiMuonSach, DocGia, Sach, NhanVien } from "../models/index.js";
import mongoose from "mongoose";

/**
 * TheoDoiMuonSach Controller - Quản lý mượn trả sách
 */

// Helper function to build search query
function buildSearchQuery(search) {
  if (!search) return {};

  // Since we're using ObjectId references, we need to search in populated fields
  // This will be handled in the aggregation pipeline
  return { searchTerm: search.trim() };
}

// Helper function to build filter query
function buildFilterQuery(filters) {
  const query = {};

  if (filters.trangThai) {
    query.TrangThai = filters.trangThai;
  }

  if (filters.docGia) {
    query.MaDocGia = filters.docGia;
  }

  if (filters.sach) {
    query.MaSach = filters.sach;
  }

  if (filters.ngayMuonFrom || filters.ngayMuonTo) {
    query.NgayMuon = {};
    if (filters.ngayMuonFrom) {
      query.NgayMuon.$gte = new Date(filters.ngayMuonFrom);
    }
    if (filters.ngayMuonTo) {
      query.NgayMuon.$lte = new Date(filters.ngayMuonTo);
    }
  }

  if (filters.quaHan === "true") {
    query.NgayHenTra = { $lt: new Date() };
    query.TrangThai = { $in: ["muon", "qua_han"] };
  }

  return query;
}

export default {
  /**
   * GET /api/theodoimuonsach - Lấy danh sách theo dõi mượn sách
   */
  async getAll(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const search = req.query.search || "";
      const sortBy = req.query.sortBy || "NgayMuon";
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

      // Build filter query
      const filterQuery = buildFilterQuery(req.query);

      // Build aggregation pipeline for search and pagination
      const pipeline = [
        { $match: filterQuery },
        {
          $lookup: {
            from: "docgias",
            localField: "MaDocGia",
            foreignField: "_id",
            as: "docgia",
          },
        },
        {
          $lookup: {
            from: "sachs",
            localField: "MaSach",
            foreignField: "_id",
            as: "sach",
          },
        },
        {
          $lookup: {
            from: "nhanviens",
            localField: "NhanVienMuon",
            foreignField: "_id",
            as: "nhanvienMuon",
          },
        },
        {
          $lookup: {
            from: "nhanviens",
            localField: "NhanVienTra",
            foreignField: "_id",
            as: "nhanvienTra",
          },
        },
        { $unwind: "$docgia" },
        { $unwind: "$sach" },
        {
          $unwind: { path: "$nhanvienMuon", preserveNullAndEmptyArrays: true },
        },
        { $unwind: { path: "$nhanvienTra", preserveNullAndEmptyArrays: true } },
      ];

      // Add search filter if provided
      if (search) {
        const searchRegex = new RegExp(search, "i");
        pipeline.push({
          $match: {
            $or: [
              { "docgia.MaDocGia": searchRegex },
              { "docgia.HoLot": searchRegex },
              { "docgia.Ten": searchRegex },
              { "sach.MaSach": searchRegex },
              { "sach.TenSach": searchRegex },
            ],
          },
        });
      }

      // Get total count
      const countPipeline = [...pipeline, { $count: "total" }];
      const countResult = await TheoDoiMuonSach.aggregate(countPipeline);
      const total = countResult[0]?.total || 0;

      // Add sorting and pagination
      pipeline.push(
        { $sort: { [sortBy]: sortOrder } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      );

      // Execute aggregation
      const data = await TheoDoiMuonSach.aggregate(pipeline);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      res.json({
        success: true,
        message: "Lấy danh sách theo dõi mượn sách thành công",
        data: {
          theodoimuonsachs: data,
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
      console.error("Get all TheoDoiMuonSach error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách theo dõi mượn sách",
        error: "GET_ALL_ERROR",
      });
    }
  },

  /**
   * GET /api/theodoimuonsach/:id - Lấy thông tin chi tiết phiếu mượn
   */
  async getById(req, res) {
    try {
      const muonSach = await TheoDoiMuonSach.findById(req.params.id)
        .populate("MaDocGia", "MaDocGia HoLot Ten DienThoai")
        .populate("MaSach", "MaSach TenSach TacGia")
        .populate("NhanVienMuon", "MSNV HoTenNV")
        .populate("NhanVienTra", "MSNV HoTenNV");

      if (!muonSach) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phiếu mượn sách",
          error: "MUONSACH_NOT_FOUND",
        });
      }

      res.json({
        success: true,
        message: "Lấy thông tin phiếu mượn sách thành công",
        data: muonSach,
      });
    } catch (error) {
      console.error("Get TheoDoiMuonSach by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy thông tin phiếu mượn sách",
        error: "GET_BY_ID_ERROR",
      });
    }
  },

  /**
   * POST /api/theodoimuonsach - Tạo phiếu mượn sách mới
   */
  async create(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { MaDocGia, MaSach, NgayHenTra, GhiChu } = req.body;
      const nhanVienId = req.user._id;

      // Validate DocGia exists
      const docGia = await DocGia.findById(MaDocGia).session(session);
      if (!docGia) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Độc giả không tồn tại",
          error: "DOCGIA_NOT_FOUND",
        });
      }

      // Validate Sach exists and is available
      const sach = await Sach.findById(MaSach).session(session);
      if (!sach) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Sách không tồn tại",
          error: "SACH_NOT_FOUND",
        });
      }

      if (sach.SoQuyen <= 0 || sach.TrangThai !== "Có sẵn") {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Sách không có sẵn để mượn",
          error: "SACH_NOT_AVAILABLE",
        });
      }

      // Check if reader already borrowed this book and hasn't returned
      const existingBorrow = await TheoDoiMuonSach.findOne({
        MaDocGia,
        MaSach,
        TrangThai: { $in: ["muon", "qua_han"] },
      }).session(session);

      if (existingBorrow) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Độc giả đã mượn sách này và chưa trả",
          error: "ALREADY_BORROWED",
        });
      }

      // Check reader's borrowing limit (max 5 books)
      const activeBorrows = await TheoDoiMuonSach.countDocuments({
        MaDocGia,
        TrangThai: { $in: ["muon", "qua_han"] },
      }).session(session);

      if (activeBorrows >= 5) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Độc giả đã mượn tối đa 5 cuốn sách",
          error: "BORROW_LIMIT_EXCEEDED",
        });
      }

      // Create borrow record
      const muonSach = new TheoDoiMuonSach({
        MaDocGia,
        MaSach,
        NgayMuon: new Date(),
        NgayHenTra: NgayHenTra ? new Date(NgayHenTra) : undefined,
        GhiChu,
        NhanVienMuon: nhanVienId,
        TrangThai: "muon",
      });

      await muonSach.save({ session });

      // Update book quantity
      await Sach.findByIdAndUpdate(
        MaSach,
        { $inc: { SoQuyen: -1 } },
        { session }
      );

      await session.commitTransaction();

      // Populate and return the created record
      await muonSach.populate([
        { path: "MaDocGia", select: "MaDocGia HoLot Ten" },
        { path: "MaSach", select: "MaSach TenSach" },
        { path: "NhanVienMuon", select: "MSNV HoTenNV" },
      ]);

      res.status(201).json({
        success: true,
        message: "Tạo phiếu mượn sách thành công",
        data: muonSach,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Create TheoDoiMuonSach error:", error);

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
        message: "Lỗi hệ thống khi tạo phiếu mượn sách",
        error: "CREATE_ERROR",
      });
    } finally {
      session.endSession();
    }
  },

  /**
   * PUT /api/theodoimuonsach/:id/return - Trả sách
   */
  async returnBook(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { GhiChu } = req.body;
      const nhanVienId = req.user._id;

      const muonSach = await TheoDoiMuonSach.findById(req.params.id).session(
        session
      );

      if (!muonSach) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phiếu mượn sách",
          error: "MUONSACH_NOT_FOUND",
        });
      }

      if (muonSach.TrangThai === "tra") {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: "Sách đã được trả trước đó",
          error: "ALREADY_RETURNED",
        });
      }

      // Update borrow record
      muonSach.NgayTra = new Date();
      muonSach.TrangThai = "tra";
      muonSach.NhanVienTra = nhanVienId;
      if (GhiChu) muonSach.GhiChu = GhiChu;

      await muonSach.save({ session });

      // Update book quantity
      await Sach.findByIdAndUpdate(
        muonSach.MaSach,
        { $inc: { SoQuyen: 1 } },
        { session }
      );

      await session.commitTransaction();

      // Populate and return the updated record
      await muonSach.populate([
        { path: "MaDocGia", select: "MaDocGia HoLot Ten" },
        { path: "MaSach", select: "MaSach TenSach" },
        { path: "NhanVienMuon", select: "MSNV HoTenNV" },
        { path: "NhanVienTra", select: "MSNV HoTenNV" },
      ]);

      res.json({
        success: true,
        message: "Trả sách thành công",
        data: muonSach,
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Return book error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi trả sách",
        error: "RETURN_ERROR",
      });
    } finally {
      session.endSession();
    }
  },

  /**
   * GET /api/theodoimuonsach/overdue - Lấy danh sách sách quá hạn
   */
  async getOverdue(req, res) {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));

      const overdueQuery = {
        TrangThai: { $in: ["muon", "qua_han"] },
        NgayHenTra: { $lt: new Date() },
      };

      const total = await TheoDoiMuonSach.countDocuments(overdueQuery);

      const overdueBooks = await TheoDoiMuonSach.find(overdueQuery)
        .populate("MaDocGia", "MaDocGia HoLot Ten DienThoai")
        .populate("MaSach", "MaSach TenSach")
        .populate("NhanVienMuon", "MSNV HoTenNV")
        .sort({ NgayHenTra: 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({
        success: true,
        message: "Lấy danh sách sách quá hạn thành công",
        data: {
          overdueBooks,
          pagination: {
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit,
          },
        },
      });
    } catch (error) {
      console.error("Get overdue books error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi lấy danh sách sách quá hạn",
        error: "GET_OVERDUE_ERROR",
      });
    }
  },

  /**
   * DELETE /api/theodoimuonsach/:id - Xóa phiếu mượn sách
   */
  async remove(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const muonSach = await TheoDoiMuonSach.findById(req.params.id).session(
        session
      );

      if (!muonSach) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phiếu mượn sách",
          error: "MUONSACH_NOT_FOUND",
        });
      }

      // If book is not returned, restore quantity
      if (muonSach.TrangThai !== "tra") {
        await Sach.findByIdAndUpdate(
          muonSach.MaSach,
          { $inc: { SoQuyen: 1 } },
          { session }
        );
      }

      await TheoDoiMuonSach.findByIdAndDelete(req.params.id).session(session);

      await session.commitTransaction();

      res.json({
        success: true,
        message: "Xóa phiếu mượn sách thành công",
        data: { deletedId: req.params.id },
      });
    } catch (error) {
      await session.abortTransaction();
      console.error("Delete TheoDoiMuonSach error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi xóa phiếu mượn sách",
        error: "DELETE_ERROR",
      });
    } finally {
      session.endSession();
    }
  },
};
