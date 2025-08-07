import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import {
  errorHandler,
  notFound,
  handleUnhandledRejection,
  handleUncaughtException,
} from "./middlewares/errorHandler.js";
import { enableResponseCompression } from "./utils/responseOptimizer.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(enableResponseCompression);

app.use("/uploads", express.static(process.env.UPLOAD_DIR || "public/uploads"));

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB kết nối thành công");
    console.log(
      "📊 Database:",
      process.env.MONGODB_DB_NAME || "quanlymuonsach"
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB xãy ra lỗi khi kết nối:", err);
    process.exit(1);
  });

import apiRouter from "./routes/index.js";
app.use("/api", apiRouter);

app.use(notFound);
app.use(errorHandler);

handleUnhandledRejection();
handleUncaughtException();

app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
