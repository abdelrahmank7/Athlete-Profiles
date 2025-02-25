import express from "express";
import { athletesDb, clubsAndSportsDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const router = express.Router();

// Fetch all athletes
router.get("/", (req, res) => {
  const { name, sport, club } = req.query;
  let query = {};
  if (name) query.name = new RegExp(name, "i");
  if (sport) query.sport = sport;
  if (club) query.club = club;

  const queryStr = "SELECT * FROM athletes";
  try {
    const stmt = athletesDb.prepare(queryStr);
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch athletes" });
  }
});

// Fetch specific athlete by ID
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM athletes WHERE id = ?";
  const params = [req.params.id];

  try {
    const stmt = athletesDb.prepare(query);
    const row = stmt.get(params);
    if (!row) {
      res.status(404).json({ error: "Athlete not found" });
    } else {
      res.json(row);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch athlete" });
  }
});

// Update athlete data
router.post("/:id/update", (req, res) => {
  const { id } = req.params;
  const {
    name,
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    currentWeight,
    fatsPercentage,
    musclePercentage,
  } = req.body;

  const query = `
    UPDATE athletes
    SET name = ?, birthdate = ?, weight = ?, targetWeight = ?, height = ?, club = ?, sport = ?, currentWeight = ?, fatsPercentage = ?, musclePercentage = ?
    WHERE id = ?
  `;
  const params = [
    name,
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    currentWeight,
    fatsPercentage,
    musclePercentage,
    id,
  ];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.json({ message: "Athlete data updated successfully" });
  } catch (err) {
    console.error("Error updating athlete data:", err.message);
    res.status(500).json({ error: "Failed to update athlete data" });
  }
});

// Add a new athlete
router.post("/", (req, res) => {
  const {
    name,
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    currentWeight,
    fatsPercentage,
    musclePercentage,
  } = req.body;
  const id = uuidv4();

  const query = `
    INSERT INTO athletes (id, name, birthdate, weight, targetWeight, height, club, sport, currentWeight, fatsPercentage, musclePercentage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    id,
    name,
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    currentWeight,
    fatsPercentage,
    musclePercentage,
  ];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(201).json({ id, ...req.body });
  } catch (err) {
    console.error("Error adding athlete:", err.message);
    res.status(500).json({ error: "Failed to add athlete" });
  }
});

// Add a new club
router.post("/clubs", (req, res) => {
  const { club } = req.body;
  if (!club) return res.status(400).json({ error: "Club name is required" });

  const query = `
    INSERT INTO clubs (name)
    VALUES (?)
  `;
  const params = [club];

  try {
    const stmt = clubsAndSportsDb.prepare(query);
    stmt.run(params);
    res.status(201).json({ message: "Club added successfully" });
  } catch (err) {
    console.error("Error adding club:", err.message);
    res.status(500).json({ error: "Failed to add club" });
  }
});

// Add a new sport
router.post("/sports", (req, res) => {
  const { sport } = req.body;
  if (!sport) return res.status(400).json({ error: "Sport name is required" });

  const query = `
    INSERT INTO sports (name)
    VALUES (?)
  `;
  const params = [sport];

  try {
    const stmt = clubsAndSportsDb.prepare(query);
    stmt.run(params);
    res.status(201).json({ message: "Sport added successfully" });
  } catch (err) {
    console.error("Error adding sport:", err.message);
    res.status(500).json({ error: "Failed to add sport" });
  }
});

// Get all clubs and sports
router.get("/filters", (req, res) => {
  clubsAndSportsDb.all("SELECT * FROM clubsAndSports", [], (err, docs) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Failed to fetch clubs and sports" });
    }
    const clubs = docs
      .filter((doc) => doc.type === "club")
      .map((doc) => doc.value);
    const sports = docs
      .filter((doc) => doc.type === "sport")
      .map((doc) => doc.value);
    res.status(200).json({ clubs, sports });
  });
});
// Add a tournament date to an athlete
router.post("/:id/appointments", (req, res) => {
  const { id } = req.params;
  const { date, tournamentName } = req.body;
  const appointmentId = crypto.randomBytes(16).toString("hex");
  if (!date || !tournamentName)
    return res
      .status(400)
      .json({ error: "Date and tournament name are required" });

  const query = `
    INSERT INTO appointments (id, athleteId, date, tournamentName)
    VALUES (?, ?, ?, ?)
  `;
  const params = [appointmentId, id, date, tournamentName];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(201).json({ message: "Appointment added successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add appointment" });
  }
});
// Delete an appointment from an athlete
router.delete("/:athleteId/appointments/:appointmentId", (req, res) => {
  const { athleteId, appointmentId } = req.params;
  const query = `
    DELETE FROM appointments
    WHERE athleteId = ? AND id = ?
  `;
  const params = [athleteId, appointmentId];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});
// Update additional information for an athlete
router.post("/:id/additional-info", (req, res) => {
  const { id } = req.params;
  const { currentWeight, fatsPercentage, musclePercentage } = req.body;
  const date = new Date().toISOString().split("T")[0];

  if (!currentWeight || !fatsPercentage || !musclePercentage) {
    return res
      .status(400)
      .json({ error: "All additional information fields are required" });
  }

  const updateDataQuery = `
    UPDATE athletes
    SET currentWeight = ?, fatsPercentage = ?, musclePercentage = ?
    WHERE id = ?
  `;
  const updateDataParams = [
    currentWeight,
    fatsPercentage,
    musclePercentage,
    id,
  ];

  const historyRecordQuery = `
    INSERT INTO history (id, athleteId, date, weight, fats, muscle)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const historyRecordParams = [
    uuidv4(),
    id,
    date,
    currentWeight,
    fatsPercentage,
    musclePercentage,
  ];

  try {
    const updateStmt = athletesDb.prepare(updateDataQuery);
    updateStmt.run(updateDataParams);

    const historyStmt = athletesDb.prepare(historyRecordQuery);
    historyStmt.run(historyRecordParams);

    res
      .status(200)
      .json({ message: "Additional information updated successfully" });
  } catch (err) {
    console.error("Error updating additional information:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a history record from an athlete
router.delete("/:athleteId/history/:recordId", (req, res) => {
  const { athleteId, recordId } = req.params;
  const query = `
    DELETE FROM history
    WHERE athleteId = ? AND id = ?
  `;
  const params = [athleteId, recordId];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(200).json({ message: "History record deleted successfully" });
  } catch (err) {
    console.error("Error deleting history record:", err.message);
    res.status(500).json({ error: "Failed to delete history record" });
  }
});

// Delete a history record from an athlete
router.delete("/:athleteId/history/:recordId", (req, res) => {
  const { athleteId, recordId } = req.params;
  const query = `
    DELETE FROM history
    WHERE athleteId = ? AND id = ?
  `;
  const params = [athleteId, recordId];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(200).json({ message: "History record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete history record" });
  }
});

// Save custom table data for an athlete
router.post("/:id/custom-table", (req, res) => {
  const { id } = req.params;
  const { tableData } = req.body;
  const query = `
    UPDATE athletes
    SET customTable = ?
    WHERE id = ?
  `;
  const params = [tableData, id];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(200).json({ message: "Table data saved successfully" });
  } catch (err) {
    console.error("Error saving table data:", err.message);
    res.status(500).json({ error: "Failed to save table data" });
  }
});

export default router;
