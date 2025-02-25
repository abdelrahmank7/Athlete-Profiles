import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Fetch tournaments for an athlete
router.get("/:athleteId/tournaments", (req, res) => {
  const { athleteId } = req.params;

  const query = `SELECT * FROM tournaments WHERE athleteId = ?`;

  try {
    const stmt = athletesDb.prepare(query);
    const rows = stmt.all(athleteId);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching tournaments:", err.message);
    res.status(500).json({ error: "Failed to fetch tournaments" });
  }
});

// Add a tournament to an athlete
router.post("/:athleteId/tournaments", (req, res) => {
  const { athleteId } = req.params;
  const { date, tournamentName } = req.body;
  const tournamentId = uuidv4();

  console.log("Received data:", req.body); // Log received data for debugging

  if (!date || !tournamentName) {
    console.log("Missing date or tournament name field");
    return res
      .status(400)
      .json({ error: "Date and tournament name are required" });
  }

  const query = `
    INSERT INTO tournaments (id, athleteId, date, tournamentName)
    VALUES (?, ?, ?, ?)
  `;
  const params = [tournamentId, athleteId, date, tournamentName];

  console.log("Executing query with params:", params); // Log query and params

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(201).json({
      message: "Tournament added successfully",
      id: tournamentId,
    });
  } catch (err) {
    console.error("Error adding tournament:", err.message); // Log detailed error message
    res.status(500).json({ error: "Failed to add tournament" });
  }
});

// Update a tournament
router.put("/:athleteId/tournaments/:tournamentId", (req, res) => {
  const { athleteId, tournamentId } = req.params;
  const { date, tournamentName } = req.body;

  const query = `
    UPDATE tournaments
    SET date = ?, tournamentName = ?
    WHERE id = ? AND athleteId = ?
  `;
  const params = [date, tournamentName, tournamentId, athleteId];

  console.log("Executing query with params:", params); // Log query and params

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(200).json({ message: "Tournament updated successfully" });
  } catch (err) {
    console.error("Error updating tournament:", err.message); // Log detailed error message
    res.status(500).json({ error: "Failed to update tournament" });
  }
});

// Delete a tournament from an athlete
router.delete("/:athleteId/tournaments/:tournamentId", (req, res) => {
  const { athleteId, tournamentId } = req.params;
  const query = `DELETE FROM tournaments WHERE id = ? AND athleteId = ?`;
  const params = [tournamentId, athleteId];

  console.log("Executing query with params:", params); // Log query and params

  try {
    const stmt = athletesDb.prepare(query);
    const result = stmt.run(params);

    if (result.changes === 0) {
      console.warn(
        `No record found with id: ${tournamentId} and athleteId: ${athleteId}`
      );
      return res.status(404).json({ error: "Tournament not found" });
    }

    res.status(200).json({ message: "Tournament deleted successfully" });
  } catch (err) {
    console.error("Error deleting tournament:", err.message); // Log detailed error message
    res.status(500).json({ error: "Failed to delete tournament" });
  }
});

export default router;
