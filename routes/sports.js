const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Add a new sport
router.post("/", (req, res) => {
  const { sport } = req.body;
  if (!sport) return res.status(400).send("Sport name is required");

  db.run(
    `
    INSERT INTO sports (name)
    VALUES (?)
  `,
    [sport],
    (err) => {
      if (err) {
        console.error("Error adding sport:", err.message);
        return res.status(500).send({ message: "Failed to add sport" });
      }
      res.status(201).send({ message: "Sport added successfully" });
    }
  );
});

// Fetch all sports
router.get("/", (req, res) => {
  db.all("SELECT * FROM sports", [], (err, rows) => {
    if (err) {
      console.error("Error fetching sports:", err.message);
      return res.status(500).send({ message: "Failed to fetch sports" });
    }
    res.status(200).send(rows);
  });
});

module.exports = router;
