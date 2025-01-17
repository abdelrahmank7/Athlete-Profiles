import express from "express";
import { athletesDb } from "../models/database.js"; // Updated to use athletesDb
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Add a supplement note to an athlete
router.post("/:id/supplements", (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const date = new Date().toISOString().split("T")[0];
  const noteId = uuidv4();

  if (!note) {
    return res.status(400).json({ error: "Supplement note is required" });
  }

  const query = `
    INSERT INTO supplements (id, athleteId, note, date)
    VALUES (?, ?, ?, ?)
  `;
  const params = [noteId, id, note, date];

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error adding supplement note:", err);
      return res.status(500).json({ error: "Failed to add supplement note" });
    }
    res.status(201).json({ message: "Supplement note added successfully" });
  });
});

// Delete a supplement note from an athlete
router.delete("/:athleteId/supplements/:noteId", (req, res) => {
  const { athleteId, noteId } = req.params;

  const query = `
    DELETE FROM supplements
    WHERE id = ? AND athleteId = ?
  `;
  const params = [noteId, athleteId];

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error deleting supplement note:", err);
      return res
        .status(500)
        .json({ error: "Failed to delete supplement note" });
    }
    res.status(200).json({ message: "Supplement note deleted successfully" });
  });
});

export default router;
