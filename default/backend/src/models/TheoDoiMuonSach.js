import mongoose from 'mongoose';

const TheoDoiMuonSachSchema = new mongoose.Schema({
  MaDocGia: { type: String, required: true, ref: 'DocGia' },
  MaSach: { type: String, required: true, ref: 'Sach' },
  NgayMuon: { type: Date, required: true },
  NgayTra: { type: Date }
});

export default mongoose.model('TheoDoiMuonSach', TheoDoiMuonSachSchema);
