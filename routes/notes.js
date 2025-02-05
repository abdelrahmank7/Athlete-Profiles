import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

// const express = require("express");
// const { athletesDb } = require("../models/database.js");
// const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Add a note to an athlete
router.post("/:id/notes", (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const date = new Date().toISOString().split("T")[0];
  const noteId = uuidv4();

  if (!note) {
    return res.status(400).json({ error: "Note is required" });
  }

  const query = `
    INSERT INTO notes (id, athleteId, note, date)
    VALUES (?, ?, ?, ?)
  `;
  const params = [noteId, id, note, date];

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error adding note:", err);
      return res.status(500).json({ error: "Failed to add note" });
    }
    res.status(201).json({ message: "Note added successfully", id: noteId });
  });
});

// Update a note
router.put("/:athleteId/notes/:noteId", (req, res) => {
  const { athleteId, noteId } = req.params;
  const { note } = req.body;
  const query = "UPDATE notes SET note = ? WHERE id = ? AND athleteId = ?";

  athletesDb.run(query, [note, noteId, athleteId], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to update note" });
    }
    res.status(200).json({ message: "Note updated successfully" });
  });
});

// Delete a note from an athlete
router.delete("/:athleteId/notes/:noteId", (req, res) => {
  const { athleteId, noteId } = req.params;

  const query = `
    DELETE FROM notes
    WHERE id = ? AND athleteId = ?
  `;
  const params = [noteId, athleteId];

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error deleting note:", err);
      return res.status(500).json({ error: "Failed to delete note" });
    }
    res.status(200).json({ message: "Note deleted successfully" });
  });
});

// Fetch notes for an athlete
router.get("/:id/notes", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM notes WHERE athleteId = ?";

  athletesDb.all(query, [id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch notes" });
    }
    res.status(200).json(rows);
  });
});

export default router;
