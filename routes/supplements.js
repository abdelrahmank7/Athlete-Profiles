import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Fetch supplements for an athlete
router.get("/:athleteId/supplements", (req, res) => {
  const { athleteId } = req.params;
  const query = `SELECT * FROM supplements WHERE athleteId = ?`;

  try {
    const stmt = athletesDb.prepare(query); // Prepare the statement
    const rows = stmt.all([athleteId]); // Execute the query and fetch all rows
    res.json(rows);
  } catch (err) {
    console.error("Error fetching supplements:", err.message);
    res.status(500).json({ error: "Failed to fetch supplements" });
  }
});

// Add a supplement to an athlete
router.post("/:athleteId/supplements", (req, res) => {
  const { athleteId } = req.params;
  const { supplement, date } = req.body;
  const supplementId = uuidv4();

  if (!supplement) {
    console.log("Missing supplement field");
    return res.status(400).json({ error: "Supplement is required" });
  }

  const query = `
    INSERT INTO supplements (id, athleteId, supplement, date)
    VALUES (?, ?, ?, ?)
  `;
  const params = [supplementId, athleteId, supplement, date];

  try {
    const stmt = athletesDb.prepare(query); // Prepare the statement
    stmt.run(params); // Execute the query
    res.status(201).json({
      message: "Supplement added successfully",
      id: supplementId,
    });
  } catch (err) {
    console.error("Error adding supplement:", err.message);
    res.status(500).json({ error: "Failed to add supplement" });
  }
});

// Update a supplement
router.put("/:athleteId/supplements/:supplementId", (req, res) => {
  const { athleteId, supplementId } = req.params;
  const { supplement } = req.body;

  const query = `
    UPDATE supplements
    SET supplement = ?
    WHERE id = ? AND athleteId = ?
  `;
  const params = [supplement, supplementId, athleteId];

  try {
    const stmt = athletesDb.prepare(query); // Prepare the statement
    stmt.run(params); // Execute the query
    res.status(200).json({ message: "Supplement updated successfully" });
  } catch (err) {
    console.error("Error updating supplement:", err.message);
    res.status(500).json({ error: "Failed to update supplement" });
  }
});

// Delete a supplement from an athlete
router.delete("/:athleteId/supplements/:supplementId", (req, res) => {
  const { athleteId, supplementId } = req.params;

  const query = `
    DELETE FROM supplements
    WHERE id = ? AND athleteId = ?
  `;
  const params = [supplementId, athleteId];

  try {
    const stmt = athletesDb.prepare(query); // Prepare the statement
    stmt.run(params); // Execute the query
    res.status(200).json({ message: "Supplement deleted successfully" });
  } catch (err) {
    console.error("Error deleting supplement:", err.message);
    res.status(500).json({ error: "Failed to delete supplement" });
  }
});

export default router;
