import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

// const express = require("express");
// const { athletesDb } = require("../models/database.js");
// const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Fetch supplements for an athlete
router.get("/:athleteId/supplements", (req, res) => {
  const { athleteId } = req.params;

  const query = `SELECT * FROM supplements WHERE athleteId = ?`;
  athletesDb.all(query, [athleteId], (err, rows) => {
    if (err) {
      console.error("Error fetching supplements:", err.message);
      return res.status(500).json({ error: "Failed to fetch supplements" });
    }
    res.json(rows);
  });
});

// Add a supplement to an athlete
router.post("/:athleteId/supplements", (req, res) => {
  const { athleteId } = req.params;
  const { supplement, date } = req.body;
  const supplementId = uuidv4();

  console.log("Received data:", req.body); // Log received data for debugging

  if (!supplement) {
    console.log("Missing supplement field");
    return res.status(400).json({ error: "Supplement is required" });
  }

  const query = `
    INSERT INTO supplements (id, athleteId, supplement, date)
    VALUES (?, ?, ?, ?)
  `;
  const params = [supplementId, athleteId, supplement, date];

  console.log("Executing query with params:", params); // Log query and params

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error adding supplement:", err.message); // Log detailed error message
      return res.status(500).json({ error: "Failed to add supplement" });
    }
    res.status(201).json({
      message: "Supplement added successfully",
      id: supplementId,
    });
  });
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

  console.log("Executing query with params:", params); // Log query and params

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error updating supplement:", err.message); // Log detailed error message
      return res.status(500).json({ error: "Failed to update supplement" });
    }
    res.status(200).json({ message: "Supplement updated successfully" });
  });
});

// Delete a supplement from an athlete
router.delete("/:athleteId/supplements/:supplementId", (req, res) => {
  const { athleteId, supplementId } = req.params;
  athletesDb.run(
    `DELETE FROM supplements WHERE id = ? AND athleteId = ?`,
    [supplementId, athleteId],
    (err) => {
      if (err) {
        console.error("Error deleting supplement:", err.message); // Log detailed error message
        return res.status(500).json({ error: "Failed to delete supplement" });
      }
      res.status(200).json({ message: "Supplement deleted successfully" });
    }
  );
});

export default router;
