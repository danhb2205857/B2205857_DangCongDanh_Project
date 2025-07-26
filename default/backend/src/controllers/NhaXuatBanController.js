import NhaXuatBan from '../models/NhaXuatBan.js';

function buildSearchQuery(search) {
  if (!search) return {};
  const regex = new RegExp(search, 'i');
  return {
    $or: [
      { MaNXB: regex },
      { TenNXB: regex },
      { DiaChi: regex }
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
      const total = await NhaXuatBan.countDocuments(query);
      const data = await NhaXuatBan.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ MaNXB: 1 });
      res.json({ data, total, totalPages: Math.ceil(total / limit), page, limit });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async getById(req, res) {
    try {
      const nxb = await NhaXuatBan.findById(req.params.id);
      if (!nxb) return res.status(404).json({ message: 'Not found' });
      res.json(nxb);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async create(req, res) {
    try {
      const nxb = new NhaXuatBan(req.body);
      await nxb.save();
      res.status(201).json(nxb);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async update(req, res) {
    try {
      const nxb = await NhaXuatBan.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!nxb) return res.status(404).json({ message: 'Not found' });
      res.json(nxb);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async remove(req, res) {
    try {
      const nxb = await NhaXuatBan.findByIdAndDelete(req.params.id);
      if (!nxb) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
