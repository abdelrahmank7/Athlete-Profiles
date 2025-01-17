import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Update additional information for an athlete
router.post("/:id/additional-info", (req, res) => {
  const { id } = req.params;
  const { currentWeight, fatsPercentage, musclePercentage } = req.body;
  const date = new Date().toISOString().split("T")[0];

  if (!currentWeight || !fatsPercentage || !musclePercentage) {
    return res
      .status(400)
      .json({ error: "All additional information fields are required" });
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
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res
        .status(200)
        .json({ message: "Additional information updated successfully" });
    }
  );
});

export default router;
