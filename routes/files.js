import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { athletesDb } from "../models/database.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const athleteId = req.params.athleteId;

    try {
      // Fetch athlete name from the database
      const query = `SELECT name FROM athletes WHERE id = ?`;
      const stmt = athletesDb.prepare(query);
      const row = stmt.get([athleteId]);

      if (!row) {
        return cb(new Error("Athlete not found"));
      }

      const athleteName = row.name;
      const folderName = `${athleteName} (${athleteId})`;
      const uploadDir = path.join(__dirname, "../models/data", folderName);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    } catch (err) {
      console.error("Error fetching athlete name:", err.message);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Handle file uploads
router.post("/:athleteId/files", upload.array("files"), (req, res) => {
  const athleteId = req.params.athleteId;

  try {
    const files = req.files.map((file) => ({
      name: file.originalname,
      path: `/models/data/${path.basename(file.destination)}/${
        file.originalname
      }`,
      uploadDate: new Date().toISOString(),
    }));

    const query = `
      INSERT INTO files (athleteId, name, path, uploadDate)
      VALUES (?, ?, ?, ?)
    `;

    const stmt = athletesDb.prepare(query);

    for (const file of files) {
      stmt.run([athleteId, file.name, file.path, file.uploadDate]);
    }

    res.status(200).json({ message: "Files uploaded successfully", files });
  } catch (err) {
    console.error("Error saving file metadata:", err.message);
    res.status(500).json({ error: "Failed to save file metadata" });
  }
});

// Fetch files for an athlete
router.get("/:athleteId/files", (req, res) => {
  const athleteId = req.params.athleteId;

  try {
    const query = `
      SELECT name, path, uploadDate
      FROM files
      WHERE athleteId = ?
    `;

    const stmt = athletesDb.prepare(query);
    const rows = stmt.all([athleteId]);

    res.status(200).json({ files: rows });
  } catch (err) {
    console.error("Error fetching files:", err.message);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

export default router;
