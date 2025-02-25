import express from "express";
import { athletesDb } from "../models/database.js";

const router = express.Router();

// Get notifications for upcoming tournaments within 30 days
router.get("/", (req, res) => {
  try {
    const query = `
      SELECT a.id as athleteId, a.name as athleteName, t.date as tournamentDate
      FROM athletes a
      LEFT JOIN tournaments t ON a.id = t.athleteId
      WHERE t.date >= date('now') AND t.date <= date('now', '+30 days')
      ORDER BY t.date ASC
    `;
    const rows = athletesDb.prepare(query).all(); // Always returns an array
    console.log("Fetched rows:", rows);

    res.json(rows); // Send the array of rows
  } catch (err) {
    console.error("SQL Query Error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;
