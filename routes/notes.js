import express from "express";
import { athletesDb } from "../models/database.js";
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

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(201).json({ message: "Note added successfully", id: noteId });
  } catch (err) {
    console.error("Error adding note:", err.message);
    res.status(500).json({ error: "Failed to add note" });
  }
});

// Update a note
router.put("/:athleteId/notes/:noteId", (req, res) => {
  const { athleteId, noteId } = req.params;
  const { note } = req.body;

  const query = "UPDATE notes SET note = ? WHERE id = ? AND athleteId = ?";
  const params = [note, noteId, athleteId];

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res.status(200).json({ message: "Note updated successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update note" });
  }
});

// Delete a note from an athlete
router.delete("/:athleteId/notes/:noteId", (req, res) => {
  const { athleteId, noteId } = req.params;

  const query = `
    DELETE FROM notes
    WHERE id = ? AND athleteId = ?
  `;
  const params = [noteId, athleteId];

  try {
    const stmt = athletesDb.prepare(query);
    const result = stmt.run(params);

    if (result.changes === 0) {
      console.warn(
        `No record found with id: ${noteId} and athleteId: ${athleteId}`
      );
      return res.status(404).json({
        status: "error",
        message: "Note not found",
      });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err.message);
    res.status(500).json({
      status: "error",
      message: `Database error occurred during deletion: ${err.message}`,
    });
  }
});

// Fetch notes for an athlete
router.get("/:id/notes", (req, res) => {
  const { id } = req.params;

  const query = "SELECT * FROM notes WHERE athleteId = ?";

  try {
    const stmt = athletesDb.prepare(query);
    const rows = stmt.all([id]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching notes:", err.message);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

export default router;
