import express from "express";
import { athletesDb } from "../models/database.js";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

const router = express.Router();

// Add a tournament date to an athlete
router.post("/:id/appointments", (req, res) => {
  const { id } = req.params;
  const { date, tournamentName } = req.body;
  const appointmentId = crypto.randomBytes(16).toString("hex");

  if (!date || !tournamentName) {
    return res
      .status(400)
      .json({ error: "Date and tournament name are required" });
  }

  athletesDb.update(
    { _id: id },
    { $push: { appointments: { _id: appointmentId, date, tournamentName } } },
    {},
    (err) => {
      if (err) {
        console.error("Error adding appointment:", err);
        return res.status(500).json({ error: "Failed to add appointment" });
      }
      res.status(201).json({ message: "Appointment added successfully" });
    }
  );
});

// Delete an appointment from an athlete
router.delete("/:athleteId/appointments/:appointmentId", (req, res) => {
  const { athleteId, appointmentId } = req.params;

  athletesDb.update(
    { _id: athleteId },
    { $pull: { appointments: { _id: appointmentId } } },
    {},
    (err) => {
      if (err) {
        console.error("Error deleting appointment:", err);
        return res.status(500).json({ error: "Failed to delete appointment" });
      }
      res.status(200).json({ message: "Appointment deleted successfully" });
    }
  );
});

export default router;
