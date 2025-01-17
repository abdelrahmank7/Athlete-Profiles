import express from "express";
import { clubsAndSportsDb } from "../models/database.js";

const router = express.Router();

// Add a new club
router.post("/", (req, res) => {
  const { club } = req.body;
  if (!club) return res.status(400).json({ error: "Club name is required" });

  const query = `
    INSERT INTO clubs (name)
    VALUES (?)
  `;
  clubsAndSportsDb.run(query, [club], (err) => {
    if (err) {
      console.error("Error adding club:", err.message);
      return res.status(500).json({ error: "Failed to add club" });
    }
    res.status(201).json({ message: "Club added successfully" });
  });
});

// Fetch all clubs
router.get("/", (req, res) => {
  const query = "SELECT * FROM clubs";
  clubsAndSportsDb.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching clubs:", err.message);
      return res.status(500).json({ error: "Failed to fetch clubs" });
    }
    res.status(200).json(rows);
  });
});

export default router;
