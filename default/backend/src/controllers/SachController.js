import Sach from '../models/Sach.js';

function buildSearchQuery(search) {
  if (!search) return {};
  const regex = new RegExp(search, 'i');
  return {
    $or: [
      { MaSach: regex },
      { TenSach: regex },
      { NguonGoc: regex },
      { TacGia: regex }
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
      const total = await Sach.countDocuments(query);
      const data = await Sach.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ MaSach: 1 });
      res.json({ data, total, totalPages: Math.ceil(total / limit), page, limit });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async getById(req, res) {
    try {
      const sach = await Sach.findById(req.params.id);
      if (!sach) return res.status(404).json({ message: 'Not found' });
      res.json(sach);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async create(req, res) {
    try {
      const sach = new Sach(req.body);
      await sach.save();
      res.status(201).json(sach);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async update(req, res) {
    try {
      const sach = await Sach.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!sach) return res.status(404).json({ message: 'Not found' });
      res.json(sach);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async remove(req, res) {
    try {
      const sach = await Sach.findByIdAndDelete(req.params.id);
      if (!sach) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
