import DocGia from '../models/DocGia.js';

// Helper for search
function buildSearchQuery(search) {
  if (!search) return {};
  const regex = new RegExp(search, 'i');
  return {
    $or: [
      { MaDocGia: regex },
      { HoLot: regex },
      { Ten: regex },
      { DiaChi: regex },
      { DienThoai: regex }
    ]
  };
}

export default {
  // GET all with pagination & search
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const query = buildSearchQuery(search);
      const total = await DocGia.countDocuments(query);
      const data = await DocGia.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ MaDocGia: 1 });
      res.json({
        data,
        total,
        totalPages: Math.ceil(total / limit),
        page,
        limit
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // GET by id
  async getById(req, res) {
    try {
      const docgia = await DocGia.findById(req.params.id);
      if (!docgia) return res.status(404).json({ message: 'Not found' });
      res.json(docgia);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // CREATE
  async create(req, res) {
    try {
      const docgia = new DocGia(req.body);
      await docgia.save();
      res.status(201).json(docgia);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // UPDATE
  async update(req, res) {
    try {
      const docgia = await DocGia.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!docgia) return res.status(404).json({ message: 'Not found' });
      res.json(docgia);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // DELETE
  async remove(req, res) {
    try {
      const docgia = await DocGia.findByIdAndDelete(req.params.id);
      if (!docgia) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
