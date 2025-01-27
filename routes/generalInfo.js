import express from "express";
import { athletesDb } from "../models/database.js";

const router = express.Router();

// Update general athlete information
router.put("/:athleteId/general-info", (req, res) => {
  const { athleteId } = req.params;
  const { birthdate, weight, targetWeight, height, club, sport } = req.body;

  const query = `
    UPDATE athletes
    SET birthdate = ?, weight = ?, targetWeight = ?, height = ?, club = ?, sport = ?
    WHERE id = ?
  `;
  const params = [
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    athleteId,
  ];

  athletesDb.run(query, params, function (err) {
    if (err) {
      console.error("Error updating general athlete information:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to update general athlete information" });
    }
    res
      .status(200)
      .json({ message: "General athlete information updated successfully" });
  });
});

export default router;
