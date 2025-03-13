import express from "express";
import { athletesDb } from "../models/database.js";

const router = express.Router();

router.post("/athlete-contacts", async (req, res) => {
  const { athleteId, phoneNumber } = req.body;

  try {
    // Check if the athlete exists
    const athleteExists = athletesDb
      .prepare("SELECT id FROM athletes WHERE id = ?")
      .get(athleteId);
    if (!athleteExists) {
      return res.status(404).json({ message: "Athlete not found." });
    }

    // Insert or update the phone number
    const insertQuery = `
      INSERT INTO athlete_contacts (athleteId, phoneNumber)
      VALUES (?, ?)
      ON CONFLICT(athleteId) DO UPDATE SET phoneNumber = excluded.phoneNumber
    `;
    athletesDb.prepare(insertQuery).run(athleteId, phoneNumber);

    res.status(200).json({ message: "Phone number saved successfully." });
  } catch (error) {
    console.error("Error saving phone number:", error);
    res.status(500).json({ message: "Failed to save phone number." });
  }
});

router.get("/athlete-contacts/:athleteId", async (req, res) => {
  const { athleteId } = req.params;

  try {
    const query =
      "SELECT phoneNumber FROM athlete_contacts WHERE athleteId = ?";
    const result = athletesDb.prepare(query).get(athleteId);

    if (!result) {
      return res.status(404).json({ message: "Phone number not found." });
    }

    res.status(200).json({ phoneNumber: result.phoneNumber });
  } catch (error) {
    console.error("Error fetching phone number:", error);
    res.status(500).json({ message: "Failed to fetch phone number." });
  }
});

export default router;
