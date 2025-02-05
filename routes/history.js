import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

// const express = require("express");
// const { athletesDb } = require("../models/database.js");
// const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Fetch history records for an athlete
router.get("/:athleteId/history", (req, res) => {
  const { athleteId } = req.params;
  const query = `SELECT * FROM history WHERE athleteId = ?`;
  console.log(`Fetching history records for athlete: ${athleteId}`);
  athletesDb.all(query, [athleteId], (err, rows) => {
    if (err) {
      console.error("Error fetching history records:", err.message);
      return res.status(500).json({ error: "Failed to fetch history records" });
    }
    res.json(rows);
  });
});

// Add a history record
router.post("/:athleteId/history", (req, res) => {
  const { athleteId } = req.params;
  const { date, weight, fats, muscle } = req.body;
  const historyId = uuidv4();

  if (!date || !weight || !fats || !muscle) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query = `
    INSERT INTO history (id, athleteId, date, weight, fats, muscle)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [historyId, athleteId, date, weight, fats, muscle];

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error adding history record:", err);
      return res.status(500).json({ error: "Failed to add history record" });
    }
    res
      .status(201)
      .json({ message: "History record added successfully", id: historyId });
  });
});

// Update a history record
router.put("/:athleteId/history/:historyId", (req, res) => {
  const { athleteId, historyId } = req.params;
  const { date, weight, fats, muscle } = req.body;

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
  query = query.slice(0, -2); // Remove last comma and space
  query += ` WHERE id = ? AND athleteId = ?`;
  params.push(historyId, athleteId);

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error updating history record:", err.message);
      return res.status(500).json({ error: "Failed to update history record" });
    }
    res.status(200).json({ message: "History record updated successfully" });
  });
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

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error deleting history record:", err.message);
      console.error("Detailed Error:", err);
      return res.status(500).json({
        status: "error",
        message: `Database error occurred during deletion: ${err.message}`,
      });
    }
    if (this.changes === 0) {
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
  });
});

export default router;
