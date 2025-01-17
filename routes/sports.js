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
  clubsAndSportsDb.run(query, [sport], (err) => {
    if (err) {
      console.error("Error adding sport:", err.message);
      return res.status(500).json({ error: "Failed to add sport" });
    }
    res.status(201).json({ message: "Sport added successfully" });
  });
});

// Fetch all sports
router.get("/", (req, res) => {
  const query = "SELECT * FROM sports";
  clubsAndSportsDb.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error fetching sports:", err.message);
      return res.status(500).json({ error: "Failed to fetch sports" });
    }
    res.status(200).json(rows);
  });
});

export default router;
