const express = require("express");
const db = require("../models/database");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Add a note to an athlete
router.post("/:id/notes", (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const date = new Date().toISOString().split("T")[0];
  const noteId = uuidv4();

  if (!note) return res.status(400).send("Note is required");

  const query = `
    INSERT INTO notes (id, athleteId, note, date)
    VALUES (?, ?, ?, ?)
  `;
  const params = [noteId, id, note, date];

  db.run(query, params, function (err) {
    if (err) return res.status(500).send(err);
    res.status(201).send({ message: "Note added successfully" });
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

  db.run(query, params, function (err) {
    if (err) return res.status(500).send(err);
    res.status(200).send({ message: "Note deleted successfully" });
  });
});

module.exports = router;
