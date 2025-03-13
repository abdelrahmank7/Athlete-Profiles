import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Fetch history records for an athlete
router.get("/:athleteId/history", (req, res) => {
  const { athleteId } = req.params;
  const query = `SELECT * FROM history WHERE athleteId = ?`;
  console.log(`Fetching history records for athlete: ${athleteId}`);

  try {
    const stmt = athletesDb.prepare(query);
    const rows = stmt.all([athleteId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching history records:", err.message);
    res.status(500).json({ error: "Failed to fetch history records" });
  }
});

// Add a history record
router.post("/:athleteId/history", (req, res) => {
  const { athleteId } = req.params;
  const { date, weight, fats, muscle, water } = req.body; // Include water
  const historyId = uuidv4();

  if (!date || !weight || !fats || !muscle || !water) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO history (id, athleteId, date, weight, fats, muscle, water)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [historyId, athleteId, date, weight, fats, muscle, water]; // Include water

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(201).json({
      message: "History record added successfully",
      id: historyId,
      water: water, // Return water value
    });
  } catch (err) {
    console.error("Error adding history record:", err.message);
    res.status(500).json({ error: "Failed to add history record" });
  }
});

// Update a history record
router.put("/:athleteId/history/:historyId", (req, res) => {
  const { athleteId, historyId } = req.params;
  const { date, weight, fats, muscle, water } = req.body; // Include water

  let query = `UPDATE history SET `;
  const params = [];

  if (date) {
    query += `date = ?, `;
    params.push(date);
  }
  if (weight) {
    query += `weight = ?, `;
    params.push(weight);
  }
  if (fats) {
    query += `fats = ?, `;
    params.push(fats);
  }
  if (muscle) {
    query += `muscle = ?, `;
    params.push(muscle);
  }
  if (water) {
    query += `water = ?, `;
    params.push(water);
  }

  query = query.slice(0, -2); // Remove last comma and space
  query += ` WHERE id = ? AND athleteId = ?`;
  params.push(historyId, athleteId);

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(200).json({ message: "History record updated successfully" });
  } catch (err) {
    console.error("Error updating history record:", err.message);
    res.status(500).json({ error: "Failed to update history record" });
  }
});

// Delete a history record
router.delete("/:athleteId/history/:historyId", (req, res) => {
  const { athleteId, historyId } = req.params;

  console.log("Received athleteId:", athleteId);
  console.log("Received historyId:", historyId);

  const query = `
    DELETE FROM history
    WHERE id = ? AND athleteId = ?
  `;
  const params = [historyId, athleteId];

  console.log("Running DELETE query with params:", params);

  try {
    const stmt = athletesDb.prepare(query);
    const result = stmt.run(params);

    if (result.changes === 0) {
      console.warn(
        `No record found with id: ${historyId} and athleteId: ${athleteId}`
      );
      return res.status(404).json({
        status: "error",
        message: "History record not found",
      });
    }

    console.log(`Successfully deleted history record with id: ${historyId}`);
    res.status(200).json({ message: "History record deleted successfully" });
  } catch (err) {
    console.error("Error deleting history record:", err.message);
    console.error("Detailed Error:", err);
    res.status(500).json({
      status: "error",
      message: `Database error occurred during deletion: ${err.message}`,
    });
  }
});

export default router;
