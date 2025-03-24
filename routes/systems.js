import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Fetch all systems
router.get("/systems", (req, res) => {
  const query = `SELECT * FROM systems`;
  try {
    const stmt = athletesDb.prepare(query);
    const systems = stmt.all();
    res.json(systems);
  } catch (err) {
    console.error("Error fetching systems:", err.message);
    res.status(500).json({ error: "Failed to fetch systems" });
  }
});

// Assign a system to an athlete
router.post("/athletes/:athleteId/system", (req, res) => {
  const { athleteId } = req.params;
  const { systemId } = req.body;
  const id = uuidv4();
  const assignedDate = new Date().toISOString();

  const query = `
    INSERT INTO athlete_systems (id, athleteId, systemId, assignedDate)
    VALUES (?, ?, ?, ?)
  `;
  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(id, athleteId, systemId, assignedDate);
    res.status(201).json({ message: "System assigned successfully" });
  } catch (err) {
    console.error("Error assigning system:", err.message);
    res.status(500).json({ error: "Failed to assign system" });
  }
});

// Generate Word file for an athlete
router.post("/athletes/:athleteId/generate-word", async (req, res) => {
  const { athleteId } = req.params;
  const { sport, systemId } = req.body;

  // Fetch athlete details
  const athleteQuery = `SELECT * FROM athletes WHERE id = ?`;
  const systemQuery = `SELECT * FROM systems WHERE id = ?`;

  try {
    const athleteStmt = athletesDb.prepare(athleteQuery);
    const athlete = athleteStmt.get(athleteId);

    const systemStmt = athletesDb.prepare(systemQuery);
    const system = systemStmt.get(systemId);

    if (!athlete || !system) {
      return res.status(404).json({ error: "Athlete or system not found" });
    }

    // Generate Word file
    const { generateWordFile } = await import("../utils/wordGenerator.js");
    const filePath = await generateWordFile(athlete, system, sport);

    res.download(filePath);
  } catch (err) {
    console.error("Error generating Word file:", err.message);
    res.status(500).json({ error: "Failed to generate Word file" });
  }
});

// Fetch the assigned system for an athlete
router.get("/athletes/:athleteId/system", (req, res) => {
  const { athleteId } = req.params;

  const query = `
      SELECT s.id, s.name, s.type, s.calories
      FROM athlete_systems AS asys
      JOIN systems AS s ON asys.systemId = s.id
      WHERE asys.athleteId = ?
    `;

  try {
    const stmt = athletesDb.prepare(query);
    const system = stmt.get(athleteId);
    if (!system) {
      return res
        .status(404)
        .json({ message: "No system assigned to this athlete." });
    }
    res.json(system);
  } catch (err) {
    console.error("Error fetching assigned system:", err.message);
    res.status(500).json({ error: "Failed to fetch assigned system" });
  }
});

// Assign or update a system for an athlete
router.put("/athletes/:athleteId/system", (req, res) => {
  const { athleteId } = req.params;
  const { systemId } = req.body;

  if (!systemId) {
    return res.status(400).json({ error: "System ID is required." });
  }

  const assignedDate = new Date().toISOString();

  const checkQuery = `SELECT id FROM athlete_systems WHERE athleteId = ?`;
  const updateQuery = `
    UPDATE athlete_systems
    SET systemId = ?, assignedDate = ?
    WHERE athleteId = ?
  `;
  const insertQuery = `
    INSERT INTO athlete_systems (id, athleteId, systemId, assignedDate)
    VALUES (?, ?, ?, ?)
  `;

  try {
    const checkStmt = athletesDb.prepare(checkQuery);
    const existing = checkStmt.get(athleteId);

    if (existing) {
      const updateStmt = athletesDb.prepare(updateQuery);
      updateStmt.run(systemId, assignedDate, athleteId);
    } else {
      const id = uuidv4();
      const insertStmt = athletesDb.prepare(insertQuery);
      insertStmt.run(id, athleteId, systemId, assignedDate);
    }

    res.status(200).json({ message: "System assigned/updated successfully" });
  } catch (err) {
    console.error("Error assigning/updating system:", err.message);
    res.status(500).json({ error: "Failed to assign/update system" });
  }
});

// Add a new system
router.post("/systems", (req, res) => {
  const { name, type, calories } = req.body;

  if (!name || !type || !calories) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const id = uuidv4();
  const query = `INSERT INTO systems (id, name, type, calories) VALUES (?, ?, ?, ?)`;

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(id, name, type, calories);
    res.status(201).json({ message: "System added successfully." });
  } catch (err) {
    console.error("Error adding system:", err.message);
    res.status(500).json({ error: "Failed to add system." });
  }
});

// Remove a system
router.delete("/systems/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM systems WHERE id = ?`;

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(id);
    res.status(200).json({ message: "System removed successfully." });
  } catch (err) {
    console.error("Error removing system:", err.message);
    res.status(500).json({ error: "Failed to remove system." });
  }
});

export default router;
