import express from "express";
import { clubsAndSportsDb } from "../models/database.js";

const router = express.Router();

// Add a new sport
router.post("/", (req, res) => {
  const { sport } = req.body;
  if (!sport) return res.status(400).json({ error: "Sport name is required" });

  const query = `
    INSERT INTO sports (name)
    VALUES (?)
  `;
  const params = [sport];

  try {
    const stmt = clubsAndSportsDb.prepare(query);
    stmt.run(params);
    res.status(201).json({ message: "Sport added successfully" });
  } catch (err) {
    console.error("Error adding sport:", err.message);
    res.status(500).json({ error: "Failed to add sport" });
  }
});

// Fetch all sports
router.get("/", (req, res) => {
  const query = "SELECT * FROM sports";

  try {
    const stmt = clubsAndSportsDb.prepare(query);
    const rows = stmt.all();
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching sports:", err.message);
    res.status(500).json({ error: "Failed to fetch sports" });
  }
});

export default router;
