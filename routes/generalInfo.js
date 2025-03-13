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

  try {
    const stmt = athletesDb.prepare(query);
    stmt.run(params);
    res
      .status(200)
      .json({ message: "General athlete information updated successfully" });
  } catch (err) {
    console.error("Error updating general athlete information:", err.message);
    res
      .status(500)
      .json({ error: "Failed to update general athlete information" });
  }
});

export default router;
