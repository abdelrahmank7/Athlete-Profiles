import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { athletesDb } from "../models/database.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const athleteId = req.params.athleteId;

    // Fetch athlete name from the database
    const query = `SELECT name FROM athletes WHERE id = ?`;
    athletesDb.get(query, [athleteId], (err, row) => {
      if (err) {
        console.error("Error fetching athlete name:", err.message);
        return cb(err);
      }

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
    });
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post("/:athleteId/files", upload.array("files"), (req, res) => {
  const athleteId = req.params.athleteId;
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

  files.forEach((file) => {
    athletesDb.run(
      query,
      [athleteId, file.name, file.path, file.uploadDate],
      (err) => {
        if (err) {
          console.error("Error saving file metadata:", err.message);
          return res
            .status(500)
            .json({ error: "Failed to save file metadata" });
        }
      }
    );
  });

  res.status(200).json({ message: "Files uploaded successfully", files });
});

router.get("/:athleteId/files", (req, res) => {
  const athleteId = req.params.athleteId;
  const query = `
    SELECT name, path, uploadDate
    FROM files
    WHERE athleteId = ?
  `;

  athletesDb.all(query, [athleteId], (err, rows) => {
    if (err) {
      console.error("Error fetching files:", err.message);
      return res.status(500).json({ error: "Failed to fetch files" });
    }
    res.status(200).json({ files: rows });
  });
});

export default router;
