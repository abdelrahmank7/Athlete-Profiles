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

  try {
    const stmt = clubsAndSportsDb.prepare(query);
    stmt.run([club]);
    res.status(201).json({ message: "Club added successfully" });
  } catch (err) {
    console.error("Error adding club:", err.message);
    res.status(500).json({ error: "Failed to add club" });
  }
});

// Fetch all clubs
router.get("/", (req, res) => {
  const query = "SELECT * FROM clubs";

  try {
    const stmt = clubsAndSportsDb.prepare(query);
    const rows = stmt.all();
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching clubs:", err.message);
    res.status(500).json({ error: "Failed to fetch clubs" });
  }
});

export default router;
