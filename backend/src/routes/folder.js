const express = require("express");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/authMiddleware");

const prisma = new PrismaClient();
const router = express.Router();

// Create folder
router.post("/", auth, async (req, res) => {
  const { name, parentId } = req.body;

  const folder = await prisma.folder.create({
    data: {
      name,
      ownerId: req.user.userId,
      parentId: parentId || null,
    },
  });

  res.json(folder);
});

// IMPORTANT: Specific route first
router.get("/root", auth, async (req, res) => {
  const folders = await prisma.folder.findMany({
    where: {
      ownerId: req.user.userId,
      parentId: null,
      isDeleted: false,
    },
  });

  res.json(folders);
});

// Then dynamic route
router.get("/:parentId", auth, async (req, res) => {
  const { parentId } = req.params;

  const folders = await prisma.folder.findMany({
    where: {
      ownerId: req.user.userId,
      parentId: parentId,
      isDeleted: false,
    },
  });

  res.json(folders);
});

module.exports = router;
