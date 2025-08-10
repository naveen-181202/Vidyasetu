import express from "express";
import dotenv from "dotenv";
import userRoute from "./routes/user.js";
import courseRoute from "./routes/courses.js";
import adminRoute from "./routes/admin.js";
import { connectDB } from "./database/db.js";
import Razorpay from "razorpay";
import cors from "cors";
import aiRoute from "./routes/aiRoutes.js";
import http from "http"; // ✅ Add this
import { Server } from "socket.io"; // ✅ Add this
import { router as chatRoutes } from "./routes/chatRoutes.js"; // ✅ Add chat routes
import axios from "axios";
import aiController from "./controllers/aiController.js";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const instance = new Razorpay({
  key_id: process.env.Razorpay_Key,
  key_secret: process.env.Razorpay_Secret,
});

const app = express();
const server = http.createServer(app); // ✅ Use HTTP server for socket.io
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Setup Socket.IO server
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://vidya-setu-frontend-ruddy.vercel.app",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Expose `io` to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

// Routes
app.use("/api", userRoute);
app.use("/api", courseRoute);
app.use("/api", adminRoute);
app.use("/api/chat", chatRoutes);
app.use("/gemini", aiRoute);
app.get("/", (req, res) => {
  res.send("✅ VidyaSetu backend is running!");
});
io.on("connection", (socket) => {
  console.log("A user connected to chat");

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Start server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB();
});
