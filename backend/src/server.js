const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const app = express();
const authMiddleware = require("./middleware/authMiddleware");
const folderRoutes = require("./routes/folder");
const fileRoutes = require("./routes/file");

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);
app.use("/uploads", express.static("uploads"));


// Test route
app.get("/", (req, res) => {
    res.send("Cloud Drive API Running 🚀");
});

app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You accessed protected data!",
        user: req.user
    });
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
