// routes/notifications.js
import express from "express";
import { getUserDatabase } from "../models/database.js";

const router = express.Router();

// Get notifications for upcoming tournaments within 30 days
router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT a.id as athleteId, a.name as athleteName, t.date as tournamentDate
      FROM athletes a
      LEFT JOIN tournaments t ON a.id = t.athleteId
      WHERE t.date >= date('now') AND t.date <= date('now', '+30 days')
      ORDER BY t.date ASC
    `;
    const rows = athletesDb.prepare(query).all();
    res.json(rows);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
