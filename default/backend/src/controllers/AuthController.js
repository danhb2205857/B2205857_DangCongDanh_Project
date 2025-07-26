import Auth from "../models/Auth.js";
import NhanVien from "../models/NhanVien.js";
import DocGia from "../models/DocGia.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config.js";

export default {
  // Đăng ký cho người dùng (DocGia)
  async register(req, res) {
    try {
      const {
        username,
        password,
        hoLot,
        ten,
        ngaySinh,
        phai,
        diaChi,
        dienThoai,
      } = req.body;
      if (
        !username ||
        !password ||
        !hoLot ||
        !ten ||
        !ngaySinh ||
        !phai ||
        !diaChi ||
        !dienThoai
      ) {
        return res.status(400).json({ message: "Thiếu thông tin đăng ký" });
      }
      const existing = await Auth.findOne({ username });
      if (existing)
        return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
      const hash = await bcrypt.hash(password, 10);
      // Tạo DocGia
      const docGia = new DocGia({
        MaDocGia: username,
        HoLot: hoLot,
        Ten: ten,
        NgaySinh: ngaySinh,
        Phai: phai,
        DiaChi: diaChi,
        DienThoai: dienThoai,
      });
      await docGia.save();
      // Tạo Auth
      const auth = new Auth({
        username,
        password: hash,
        role: "user",
        linkedId: docGia._id,
      });
      await auth.save();
      res.status(201).json({ message: "Đăng ký thành công" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Đăng nhập cho admin và user
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await Auth.findOne({ username });
      if (!user)
        return res.status(400).json({ 
          message: "Sai tên đăng nhập hoặc mật khẩu" 
        });
      
      //const match = await bcrypt.compare(password, user.password);
      if(password !== user.password)
        return res.status(400).json({ 
          message: "Sai tên đăng nhập hoặc mật khẩu" 
        });
      const token = jwt.sign(
        { id: user._id, role: user.role },
        config.jwtSecret,
        { expiresIn: "1d" }
      );
      res.json({ token, role: user.role });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Đăng xuất (client chỉ cần xoá token phía frontend)
  logout(req, res) {
    // Đăng xuất chỉ là xoá token phía client
    res.json({ message: "Đăng xuất thành công" });
  },
};
