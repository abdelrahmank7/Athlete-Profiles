const express = require("express");
const db = require("../models/database");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Add a supplement note to an athlete
router.post("/:id/supplements", (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const date = new Date().toISOString().split("T")[0];
  const noteId = uuidv4();

  if (!note) return res.status(400).send("Supplement note is required");

  const query = `
    INSERT INTO supplements (id, athleteId, note, date)
    VALUES (?, ?, ?, ?)
  `;
  const params = [noteId, id, note, date];

  db.run(query, params, function (err) {
    if (err) return res.status(500).send(err);
    res.status(201).send({ message: "Supplement note added successfully" });
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

  db.run(query, params, function (err) {
    if (err) return res.status(500).send(err);
    res.status(200).send({ message: "Supplement note deleted successfully" });
  });
});

module.exports = router;
