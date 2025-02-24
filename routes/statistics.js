// routes/statistics.js
import express from "express";
import { getUserDatabase } from "../models/database.js";

const router = express.Router();

// Get athlete statistics
router.get("/", async (req, res) => {
  try {
    const totalAthletes = athletesDb
      .prepare("SELECT COUNT(*) AS count FROM athletes")
      .get().count;
    const sportsStats = athletesDb
      .prepare("SELECT sport, COUNT(*) AS count FROM athletes GROUP BY sport")
      .all();
    const clubsStats = athletesDb
      .prepare("SELECT club, COUNT(*) AS count FROM athletes GROUP BY club")
      .all();

    res.json({
      totalAthletes,
      sportsStats,
      clubsStats,
    });
  } catch (err) {
    console.error("Error fetching statistics:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
