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
  athletesDb.all("SELECT * FROM athletes", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch athletes" });
      return;
    }
    res.json(rows);
  });
});

// Fetch specific athlete by ID
router.get("/:id", (req, res) => {
  const query = "SELECT * FROM athletes WHERE id = ?";
  athletesDb.get(query, [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch athlete" });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Athlete not found" });
      return;
    }
    res.json(row);
  });
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
  athletesDb.run(query, params, (err) => {
    if (err) {
      res.status(500).json({ error: "Failed to update athlete data" });
      return;
    }
    res.json({ message: "Athlete data updated successfully" });
  });
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
  athletesDb.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: "Failed to add athlete" });
      return;
    }
    res.status(201).json({ id, ...req.body });
  });
});

// Add a new club
router.post("/clubs", (req, res) => {
  const { club } = req.body;
  if (!club) return res.status(400).json({ error: "Club name is required" });
  clubsAndSportsDb.run(
    `
    INSERT INTO clubs (name)
    VALUES (?)
  `,
    [club],
    (err) => {
      if (err) {
        console.error("Error adding club:", err.message);
        return res.status(500).json({ error: "Failed to add club" });
      }
      res.status(201).json({ message: "Club added successfully" });
    }
  );
});

// Add a new sport
router.post("/sports", (req, res) => {
  const { sport } = req.body;
  if (!sport) return res.status(400).json({ error: "Sport name is required" });
  clubsAndSportsDb.run(
    `
    INSERT INTO sports (name)
    VALUES (?)
  `,
    [sport],
    (err) => {
      if (err) {
        console.error("Error adding sport:", err.message);
        return res.status(500).json({ error: "Failed to add sport" });
      }
      res.status(201).json({ message: "Sport added successfully" });
    }
  );
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

// Add a supplement note to an athlete
router.post("/:id/supplements", (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const date = new Date().toISOString().split("T")[0];
  const noteId = uuidv4();
  if (!note)
    return res.status(400).json({ error: "Supplement note is required" });
  athletesDb.update(
    { _id: id },
    { $push: { supplementNotes: { _id: noteId, note, date } } },
    {},
    (err) => {
      if (err)
        return res.status(500).json({ error: "Failed to add supplement note" });
      res.status(201).json({ message: "Supplement note added successfully" });
    }
  );
});

// Delete a supplement note from an athlete
router.delete("/:athleteId/supplements/:noteId", (req, res) => {
  const { athleteId, noteId } = req.params;
  athletesDb.update(
    { _id: athleteId },
    { $pull: { supplementNotes: { _id: noteId } } },
    {},
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Failed to delete supplement note" });
      res.status(200).json({ message: "Supplement note deleted successfully" });
    }
  );
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
  athletesDb.update(
    { _id: id },
    { $push: { appointments: { _id: appointmentId, date, tournamentName } } },
    {},
    (err) => {
      if (err)
        return res.status(500).json({ error: "Failed to add appointment" });
      res.status(201).json({ message: "Appointment added successfully" });
    }
  );
});

// Delete an appointment from an athlete
router.delete("/:athleteId/appointments/:appointmentId", (req, res) => {
  const { athleteId, appointmentId } = req.params;
  athletesDb.update(
    { _id: athleteId },
    { $pull: { appointments: { _id: appointmentId } } },
    {},
    (err) => {
      if (err)
        return res.status(500).json({ error: "Failed to delete appointment" });
      res.status(200).json({ message: "Appointment deleted successfully" });
    }
  );
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
  const updateData = {
    currentWeight,
    fatsPercentage,
    musclePercentage,
  };
  const historyRecord = {
    _id: uuidv4(),
    date,
    weight: currentWeight,
    fats: fatsPercentage,
    muscle: Percentage,
  };
  athletesDb.update(
    { _id: id },
    { $set: updateData, $push: { history: historyRecord } },
    {},
    (err) => {
      if (err) {
        console.error("Error updating additional information:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res
        .status(200)
        .json({ message: "Additional information updated successfully" });
    }
  );
});

// Delete a history record from an athlete
router.delete("/:athleteId/history/:recordId", (req, res) => {
  const { athleteId, recordId } = req.params;
  athletesDb.update(
    { _id: athleteId },
    { $pull: { history: { _id: recordId } } },
    {},
    (err) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Failed to delete history record" });
      res.status(200).json({ message: "History record deleted successfully" });
    }
  );
});

// Save custom table data for an athlete
router.post("/:id/custom-table", (req, res) => {
  const { id } = req.params;
  const { tableData } = req.body;
  athletesDb.update(
    { _id: id },
    { $set: { customTable: tableData } },
    {},
    (err) => {
      if (err)
        return res.status(500).json({ error: "Failed to save table data" });
      res.status(200).json({ message: "Table data saved successfully" });
    }
  );
});

export default router;
