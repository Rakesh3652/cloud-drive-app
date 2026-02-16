const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const path = require("path");
const fs = require("fs");

const prisma = new PrismaClient();
const router = express.Router();

/* =========================
   DOWNLOAD (FIRST!)
========================= */
router.get("/download/:id", auth, async (req, res) => {
  const { id } = req.params;

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return res.status(404).json({ error: "File not found" });

  if (file.ownerId !== req.user.userId)
    return res.status(403).json({ error: "Forbidden" });

  const filePath = path.join(__dirname, "../../uploads", file.path);

  if (!fs.existsSync(filePath))
    return res.status(404).json({ error: "File missing" });

  res.download(filePath, file.name);
});

/* =========================
   UPLOAD
========================= */
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  const { folderId } = req.body;

  if (!req.file)
    return res.status(400).json({ error: "No file uploaded" });

  const file = await prisma.file.create({
    data: {
      name: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.filename,
      ownerId: req.user.userId,
      folderId: folderId || null,
    },
  });

  res.json(file);
});

/* =========================
   ROOT FILES
========================= */
router.get("/root", auth, async (req, res) => {
  const files = await prisma.file.findMany({
    where: {
      ownerId: req.user.userId,
      folderId: null,
      isDeleted: false,
    },
  });

  res.json(files);
});

/* =========================
   FILES BY FOLDER
========================= */
router.get("/:folderId", auth, async (req, res) => {
  const { folderId } = req.params;

  const files = await prisma.file.findMany({
    where: {
      ownerId: req.user.userId,
      folderId: folderId,
      isDeleted: false,
    },
  });

  res.json(files);
});

/* =========================
   DELETE
========================= */
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  await prisma.file.update({
    where: { id },
    data: { isDeleted: true },
  });

  res.json({ message: "Deleted" });
});

module.exports = router;
