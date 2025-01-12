const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../models/database");
const Athlete = require("../models/athlete");

router.get("/", (req, res) => {
  const query = "SELECT * FROM athletes";
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

router.post("/", (req, res) => {
  const {
    name,
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    currentWeight,
    fatsPercentage,
    musclePercentage,
  } = req.body;
  const id = uuidv4();
  const query = ` INSERT INTO athletes (id, name, birthdate, weight, targetWeight, height, club, sport, currentWeight, fatsPercentage, musclePercentage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;
  const params = [
    id,
    name,
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    currentWeight,
    fatsPercentage,
    musclePercentage,
  ];
  console.log("Adding athlete to database:", params);
  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, ...req.body });
  });
});
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM athletes WHERE id = ?";
  console.log("Fetching athlete from database with ID:", id);
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Athlete not found" });
      return;
    }
    const athlete = Athlete.fromRow(row);
    res.json(athlete);
  });
});
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    name,
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    currentWeight,
    fatsPercentage,
    musclePercentage,
  } = req.body;
  const query = `
    UPDATE athletes
    SET name = ?, birthdate = ?, weight = ?, targetWeight = ?, height = ?, club = ?, sport = ?, currentWeight = ?, fatsPercentage = ?, musclePercentage = ?
    WHERE id = ?
  `;
  const params = [
    name,
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    currentWeight,
    fatsPercentage,
    musclePercentage,
    id,
  ];
  db.run(query, params, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, ...req.body });
  });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM athletes WHERE id = ?";
  db.run(query, [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "Athlete deleted" });
  });
});

module.exports = router;
