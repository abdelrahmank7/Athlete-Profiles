const express = require("express");
const { clubsAndSportsDb } = require("../models/database");
const router = express.Router();

// Get all clubs and sports
router.get("/", (req, res) => {
  clubsAndSportsDb.find(
    { $or: [{ type: "club" }, { type: "sport" }] },
    (err, docs) => {
      if (err) return res.status(500).send(err);

      const clubs = docs
        .filter((doc) => doc.type === "club")
        .map((doc) => doc.value);
      const sports = docs
        .filter((doc) => doc.type === "sport")
        .map((doc) => doc.value);

      res.send({ clubs, sports });
    }
  );
});

module.exports = router;
