import NhanVien from '../models/NhanVien.js';

function buildSearchQuery(search) {
  if (!search) return {};
  const regex = new RegExp(search, 'i');
  return {
    $or: [
      { MSNV: regex },
      { HoTenNV: regex },
      { ChucVu: regex },
      { DiaChi: regex },
      { SoDienThoai: regex }
    ]
  };
}

export default {
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || '';
      const query = buildSearchQuery(search);
      const total = await NhanVien.countDocuments(query);
      const data = await NhanVien.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ MSNV: 1 });
      res.json({ data, total, totalPages: Math.ceil(total / limit), page, limit });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async getById(req, res) {
    try {
      const nv = await NhanVien.findById(req.params.id);
      if (!nv) return res.status(404).json({ message: 'Not found' });
      res.json(nv);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async create(req, res) {
    try {
      const nv = new NhanVien(req.body);
      await nv.save();
      res.status(201).json(nv);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async update(req, res) {
    try {
      const nv = await NhanVien.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!nv) return res.status(404).json({ message: 'Not found' });
      res.json(nv);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async remove(req, res) {
    try {
      const nv = await NhanVien.findByIdAndDelete(req.params.id);
      if (!nv) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
