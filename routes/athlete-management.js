// routes/athlete-management.js
import express from "express";
import { athletesDb } from "../models/database.js"; // Ensure this is correctly imported
import Athlete from "../models/athlete.js";

const router = express.Router();

// Fetch athletes with optional filters
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
      .filter((athlete) => athlete !== null); // Filter out null values
    res.json(athletes);
  } catch (err) {
    console.error("Error fetching athletes:", err);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

// Delete an athlete
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID parameter
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid athlete ID" });
    }

    console.log(`Attempting to delete athlete with ID: ${id}`);

    // Define dependent tables
    const dependentTables = [
      "notes",
      "supplements",
      "tournaments",
      "appointments",
      "history",
      "customTable",
      "files",
    ];

    // Delete related records in dependent tables
    for (const table of dependentTables) {
      const deleteQuery = `DELETE FROM ${table} WHERE athleteId = ?`;
      const deleteStmt = athletesDb.prepare(deleteQuery);
      const result = deleteStmt.run(id);
      console.log(
        `Deleted ${result.changes} records from ${table} for athlete ID: ${id}`
      );
    }

    // Proceed to delete the athlete
    const deleteAthleteQuery = "DELETE FROM athletes WHERE id = ?";
    const deleteAthleteStmt = athletesDb.prepare(deleteAthleteQuery);
    const athleteResult = deleteAthleteStmt.run(id);

    if (athleteResult.changes === 0) {
      console.warn(`Athlete with ID: ${id} not found.`);
      return res.status(404).json({ message: "Athlete not found" });
    }

    res.json({
      message: "Athlete and all related records removed successfully",
    });
  } catch (err) {
    console.error("Error deleting athlete:", err);
    res.status(500).json({ message: "An internal server error occurred" });
  }
});

export default router;
