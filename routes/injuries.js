import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Fetch injuries for an athlete
router.get("/:athleteId/injuries", (req, res) => {
  const { athleteId } = req.params;
  const query = `SELECT * FROM injuries WHERE athleteId = ?`;
  console.log(`Fetching injuries for athlete: ${athleteId}`);

  try {
    const stmt = athletesDb.prepare(query);
    const rows = stmt.all([athleteId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching injuries:", err.message);
    res.status(500).json({ error: "Failed to fetch injuries" });
  }
});

// Add an injury
router.post("/:athleteId/injuries", (req, res) => {
  const { athleteId } = req.params;
  const { injury, date } = req.body;
  const injuryId = uuidv4();

  if (!injury || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO injuries (id, athleteId, injury, date)
    VALUES (?, ?, ?, ?)
  `;
  const params = [injuryId, athleteId, injury, date];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(201).json({ id: injuryId });
  } catch (err) {
    console.error("Error adding injury:", err.message);
    res.status(500).json({ error: "Failed to add injury" });
  }
});

// Update an injury
router.put("/:athleteId/injuries/:injuryId", (req, res) => {
  const { athleteId, injuryId } = req.params;
  const { injury, date } = req.body;

  if (!injury || !date) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    UPDATE injuries
    SET injury = ?, date = ?
    WHERE id = ? AND athleteId = ?
  `;
  const params = [injury, date, injuryId, athleteId];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(200).json({ message: "Injury updated successfully" });
  } catch (err) {
    console.error("Error updating injury:", err.message);
    res.status(500).json({ error: "Failed to update injury" });
  }
});

// Delete an injury
router.delete("/:athleteId/injuries/:injuryId", (req, res) => {
  const { athleteId, injuryId } = req.params;

  const query = `DELETE FROM injuries WHERE id = ? AND athleteId = ?`;
  const params = [injuryId, athleteId];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(200).json({ message: "Injury deleted successfully" });
  } catch (err) {
    console.error("Error deleting injury:", err.message);
    res.status(500).json({ error: "Failed to delete injury" });
  }
});

export default router;
