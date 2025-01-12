const express = require("express");
const { athletesDb } = require("../models/database");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Add a tournament date to an athlete
router.post("/:id/appointments", (req, res) => {
  const { id } = req.params;
  const { date, tournamentName } = req.body;
  const appointmentId = require("crypto").randomBytes(16).toString("hex");

  if (!date || !tournamentName)
    return res.status(400).send("Date and tournament name are required");

  athletesDb.update(
    { _id: id },
    { $push: { appointments: { _id: appointmentId, date, tournamentName } } },
    {},
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: "Appointment added successfully" });
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
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: "Appointment deleted successfully" });
    }
  );
});

module.exports = router;
