import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

// const express = require("express");
// const { athletesDb } = require("../models/database.js");
// const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Fetch tournaments for an athlete
router.get("/:athleteId/tournaments", (req, res) => {
  const { athleteId } = req.params;

  const query = `SELECT * FROM tournaments WHERE athleteId = ?`;
  athletesDb.all(query, [athleteId], (err, rows) => {
    if (err) {
      console.error("Error fetching tournaments:", err.message);
      return res.status(500).json({ error: "Failed to fetch tournaments" });
    }
    res.json(rows);
  });
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

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error adding tournament:", err.message); // Log detailed error message
      return res.status(500).json({ error: "Failed to add tournament" });
    }
    res.status(201).json({
      message: "Tournament added successfully",
      id: tournamentId,
    });
  });
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

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error updating tournament:", err.message); // Log detailed error message
      return res.status(500).json({ error: "Failed to update tournament" });
    }
    res.status(200).json({ message: "Tournament updated successfully" });
  });
});

// Delete a tournament from an athlete
router.delete("/:athleteId/tournaments/:tournamentId", (req, res) => {
  const { athleteId, tournamentId } = req.params;
  athletesDb.run(
    `DELETE FROM tournaments WHERE id = ? AND athleteId = ?`,
    [tournamentId, athleteId],
    (err) => {
      if (err) {
        console.error("Error deleting tournament:", err.message); // Log detailed error message
        return res.status(500).json({ error: "Failed to delete tournament" });
      }
      res.status(200).json({ message: "Tournament deleted successfully" });
    }
  );
});

export default router;
