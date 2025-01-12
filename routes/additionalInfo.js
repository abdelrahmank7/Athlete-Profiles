const express = require("express");
const { athletesDb } = require("../models/database");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Update additional information for an athlete
router.post("/:id/additional-info", (req, res) => {
  const { id } = req.params;
  const { currentWeight, fatsPercentage, musclePercentage } = req.body;
  const date = new Date().toISOString().split("T")[0];

  if (!currentWeight || !fatsPercentage || !musclePercentage) {
    return res
      .status(400)
      .send("All additional information fields are required");
  }

  const updateData = {
    currentWeight,
    fatsPercentage,
    musclePercentage,
  };

  const historyRecord = {
    _id: uuidv4(),
    date,
    weight: currentWeight,
    fats: fatsPercentage,
    muscle: musclePercentage,
  };

  athletesDb.update(
    { _id: id },
    { $set: updateData, $push: { history: historyRecord } },
    {},
    (err) => {
      if (err) {
        console.error("Error updating additional information:", err);
        return res.status(500).send("Internal Server Error");
      }
      res
        .status(200)
        .send({ message: "Additional information updated successfully" });
    }
  );
});

module.exports = router;
