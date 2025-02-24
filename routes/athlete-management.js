// routes/athlete-management.js
import express from "express";
import { athletesDb, clubsAndSportsDb } from "../models/database.js";
import Athlete from "../models/athlete.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { name, club, sport } = req.query;
    let query = `
      SELECT a.*, t.date AS tournamentDate
      FROM athletes a
      LEFT JOIN tournaments t ON a.id = t.athleteId AND t.date >= date('now')
    `;
    const conditions = [];
    const params = [];

    if (name) {
      conditions.push("a.name LIKE ?");
      params.push(`%${name}%`);
    }
    if (club) {
      conditions.push("a.club = ?");
      params.push(club);
    }
    if (sport) {
      conditions.push("a.sport = ?");
      params.push(sport);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY t.date ASC";

    const rows = athletesDb.prepare(query).all(params);
    if (!Array.isArray(rows)) {
      throw new Error("Expected rows to be an array");
    }

    const athletes = rows
      .map((row) => {
        const athlete = Athlete.fromRow(row);
        if (athlete) {
          return {
            ...athlete,
            tournamentDate: row.tournamentDate,
          };
        }
        return null;
      })
      .filter((athlete) => athlete !== null); // Add this line to filter out null values

    res.json(athletes);
  } catch (err) {
    console.error("Error fetching athletes:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete an athlete
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Attempting to delete athlete with ID: ${id}`);
    const result = athletesDb
      .prepare("DELETE FROM athletes WHERE id = ?")
      .run(id);
    console.log(`DELETE result: ${JSON.stringify(result)}`);
    if (result.changes === 0) {
      console.warn(`Athlete with ID: ${id} not found.`);
      return res.status(404).json({ message: "Athlete not found" });
    }
    res.json({ message: "Athlete removed" });
  } catch (err) {
    console.error("Error deleting athlete:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
