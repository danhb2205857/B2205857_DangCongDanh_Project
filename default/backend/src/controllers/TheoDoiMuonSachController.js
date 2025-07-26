import TheoDoiMuonSach from '../models/TheoDoiMuonSach.js';

function buildSearchQuery(search) {
  if (!search) return {};
  const regex = new RegExp(search, 'i');
  return {
    $or: [
      { MaDocGia: regex },
      { MaSach: regex }
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
      const total = await TheoDoiMuonSach.countDocuments(query);
      const data = await TheoDoiMuonSach.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ NgayMuon: -1 });
      res.json({ data, total, totalPages: Math.ceil(total / limit), page, limit });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async getById(req, res) {
    try {
      const muon = await TheoDoiMuonSach.findById(req.params.id);
      if (!muon) return res.status(404).json({ message: 'Not found' });
      res.json(muon);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  async create(req, res) {
    try {
      const muon = new TheoDoiMuonSach(req.body);
      await muon.save();
      res.status(201).json(muon);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async update(req, res) {
    try {
      const muon = await TheoDoiMuonSach.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!muon) return res.status(404).json({ message: 'Not found' });
      res.json(muon);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async remove(req, res) {
    try {
      const muon = await TheoDoiMuonSach.findByIdAndDelete(req.params.id);
      if (!muon) return res.status(404).json({ message: 'Not found' });
      res.json({ message: 'Deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
