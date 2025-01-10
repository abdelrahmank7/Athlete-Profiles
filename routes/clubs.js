const express = require("express");
const db = require("../models/database");
const router = express.Router();

// Add a new club
router.post("/", (req, res) => {
  const { club } = req.body;
  if (!club) return res.status(400).send("Club name is required");

  db.run(
    `
    INSERT INTO clubs (name)
    VALUES (?)
  `,
    [club],
    (err) => {
      if (err) {
        console.error("Error adding club:", err.message);
        return res.status(500).send({ message: "Failed to add club" });
      }
      res.status(201).send({ message: "Club added successfully" });
    }
  );
});

// Fetch all clubs
router.get("/", (req, res) => {
  db.all("SELECT * FROM clubs", [], (err, rows) => {
    if (err) {
      console.error("Error fetching clubs:", err.message);
      return res.status(500).send({ message: "Failed to fetch clubs" });
    }
    res.status(200).send(rows);
  });
});

module.exports = router;
