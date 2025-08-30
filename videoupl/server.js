const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

// JWT Secret
const SECRET_KEY = "mysecretkey";

// Read users.json file
let users = JSON.parse(fs.readFileSync("users.json", "utf8"));

// Setup file storage (uploads folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// 🔹 Home Route (fix Cannot GET /)
app.get("/", (req, res) => {
  res.send("🚀 Server is running! Use /login, /upload or /files");
});

// 🔹 Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
});

// 🔹 Middleware for JWT check
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "No token provided" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    req.user = decoded;
    next();
  });
}

// 🔹 File upload route (only logged-in users)
app.post("/upload", verifyToken, upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded successfully", file: req.file });
});

// 🔹 Get list of uploaded files
app.get("/files", verifyToken, (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) return res.status(500).json({ message: "Error reading files" });
    res.json({ files });
  });
});

// Server start
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
