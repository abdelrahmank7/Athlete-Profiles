import express from "express";
import { athletesDb } from "../models/database.js"; // Updated to use athletesDb
import { v4 as uuidv4 } from "uuid";

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
    res.status(201).json({ message: "Note added successfully" });
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

export default router;
