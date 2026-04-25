const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Member = require("../models/Member");

const router = express.Router();

// Multer saves uploaded images inside the uploads folder.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueFileName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);

    cb(null, uniqueFileName);
  },
});

const upload = multer({ storage: storage });

// POST /api/members
// Add a new team member with an uploaded image.
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, role, email } = req.body;

    if (!name || !role || !email || !req.file) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newMember = new Member({
      name,
      role,
      email,
      image: req.file.filename,
    });

    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(500).json({ message: "Could not add member." });
  }
});

// GET /api/members
// Return all team members.
router.get("/", async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch members." });
  }
});

// GET /api/members/:id
// Return one team member by MongoDB id.
router.get("/:id", async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    res.json(member);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Member not found." });
    }

    res.status(500).json({ message: "Could not fetch member details." });
  }
});

// PUT /api/members/:id
// Update a team member. A new image is optional during edit.
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, role, email } = req.body;

    if (!name || !role || !email) {
      return res.status(400).json({ message: "Name, role, and email are required." });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: "Member not found." });
    }

    // If a new image is uploaded, keep the new filename and remove the old local file.
    if (req.file) {
      const oldImagePath = path.join(__dirname, "..", "uploads", member.image);

      if (fs.existsSync(oldImagePath) && member.image !== req.file.filename) {
        fs.unlinkSync(oldImagePath);
      }

      member.image = req.file.filename;
    }

    member.name = name;
    member.role = role;
    member.email = email;

    const updatedMember = await member.save();
    res.json(updatedMember);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Member not found." });
    }

    res.status(500).json({ message: "Could not update member." });
  }
});

module.exports = router;
