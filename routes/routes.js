const express = require("express");
const { athletesDb, clubsAndSportsDb } = require("../models/database");
const Athlete = require("../models/athlete");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Fetch athletes
router.get("/athletes", (req, res) => {
  const { name, sport, club } = req.query;
  let query = {};
  if (name) query.name = new RegExp(name, "i");
  if (sport) query.sport = sport;
  if (club) query.club = club;
  athletesDb.find(query, (err, docs) => {
    if (err) return res.status(500).send(err);
    res.send(docs);
  });
});

// Fetch specific athlete by ID
router.get("/athletes/:id", (req, res) => {
  athletesDb.findOne({ _id: req.params.id }, (err, athlete) => {
    if (err) return res.status(500).send(err);
    if (!athlete) return res.status(404).send("Athlete not found");
    res.send(athlete);
  });
});

// router.post("/athletes/:id/update", (req, res) => {
//   const { id } = req.params;
//   const { name, birthdate, weight, targetWeight, height, club, sport } =
//     req.body;

//   const athleteData = {
//     name,
//     birthdate,
//     weight,
//     targetWeight,
//     height,
//     club,
//     sport,
//   };

//   athletesDb.update(
//     { _id: id },
//     { $set: athleteData },
//     { upsert: true },
//     (err) => {
//       if (err) return res.status(500).send(err);
//       res.status(200).send({ message: "Athlete data updated successfully" });
//     }
//   );
// });

router.post("/athletes/:id/update", (req, res) => {
  const { id } = req.params;
  const athleteData = req.body;

  athletesDb.update(
    { _id: id },
    { $set: athleteData },
    { upsert: true },
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: "Athlete data updated successfully" });
    }
  );
});

// Add a new athlete
router.post("/athlete", (req, res) => {
  const { name, birthdate, weight, targetWeight, height, club, sport } =
    req.body;
  if (
    !name ||
    !birthdate ||
    !weight ||
    !targetWeight ||
    !height ||
    !club ||
    !sport
  )
    return res.status(400).send("All fields are required");

  const athlete = {
    name,
    birthdate,
    weight,
    targetWeight,
    height,
    club,
    sport,
    notes: [],
    supplementNotes: [],
    appointments: [],
    dataPoints: [],
    history: [],
  };

  athletesDb.insert(athlete, (err, newAthlete) => {
    if (err) return res.status(500).send(err);
    res.status(201).send(newAthlete);
  });
});

// Add a new club
router.post("/clubs", (req, res) => {
  const { club } = req.body;
  if (!club) return res.status(400).send("Club name is required");

  clubsAndSportsDb.update(
    { type: "club", value: club },
    { type: "club", value: club },
    { upsert: true },
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: "Club added successfully" });
    }
  );
});

// Add a new sport
router.post("/sports", (req, res) => {
  const { sport } = req.body;
  if (!sport) return res.status(400).send("Sport name is required");

  clubsAndSportsDb.update(
    { type: "sport", value: sport },
    { type: "sport", value: sport },
    { upsert: true },
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: "Sport added successfully" });
    }
  );
});

// Get all clubs and sports
router.get("/filters", (req, res) => {
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

// Add a note to an athlete
router.post("/athletes/:id/notes", (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const date = new Date().toISOString().split("T")[0]; // Extract date part
  const noteId = uuidv4();

  if (!note) return res.status(400).send("Note is required");

  athletesDb.update(
    { _id: id },
    { $push: { notes: { _id: noteId, note, date } } },
    {},
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: "Note added successfully" });
    }
  );
});

// Delete a note from an athlete
router.delete("/athletes/:athleteId/notes/:noteId", (req, res) => {
  const { athleteId, noteId } = req.params;

  athletesDb.update(
    { _id: athleteId },
    { $pull: { notes: { _id: noteId } } },
    {},
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: "Note deleted successfully" });
    }
  );
});

// Add a supplement note to an athlete
router.post("/athletes/:id/supplements", (req, res) => {
  const { id } = req.params;
  const { note } = req.body;
  const date = new Date().toISOString().split("T")[0]; // Extract date part
  const noteId = uuidv4();

  if (!note) return res.status(400).send("Supplement note is required");

  athletesDb.update(
    { _id: id },
    { $push: { supplementNotes: { _id: noteId, note, date } } },
    {},
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: "Supplement note added successfully" });
    }
  );
});

// Delete a supplement note from an athlete
router.delete("/athletes/:athleteId/supplements/:noteId", (req, res) => {
  const { athleteId, noteId } = req.params;

  athletesDb.update(
    { _id: athleteId },
    { $pull: { supplementNotes: { _id: noteId } } },
    {},
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: "Supplement note deleted successfully" });
    }
  );
});

// Add a tournament date to an athlete
router.post("/athletes/:id/appointments", (req, res) => {
  const { id } = req.params;
  const { date, tournamentName } = req.body; // Include tournamentName
  const appointmentId = require("crypto").randomBytes(16).toString("hex");

  if (!date || !tournamentName)
    return res.status(400).send("Date and tournament name are required");

  athletesDb.update(
    { _id: id },
    { $push: { appointments: { _id: appointmentId, date, tournamentName } } }, // Store tournamentName
    {},
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: "Appointment added successfully" });
    }
  );
});

// Delete an appointment from an athlete
router.delete(
  "/athletes/:athleteId/appointments/:appointmentId",
  (req, res) => {
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
  }
);

// Update additional information for an athlete
router.post("/athletes/:id/additional-info", (req, res) => {
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
    _id: uuidv4(), // Generate a unique ID for the history record
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

// Delete a history record from an athlete
router.delete("/athletes/:athleteId/history/:recordId", (req, res) => {
  const { athleteId, recordId } = req.params;
  athletesDb.update(
    { _id: athleteId },
    { $pull: { history: { _id: recordId } } },
    {},
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: "History record deleted successfully" });
    }
  );
});

router.post("/athletes/:id/custom-table", (req, res) => {
  const { id } = req.params;
  const { tableData } = req.body;

  athletesDb.update(
    { _id: id },
    { $set: { customTable: tableData } },
    {},
    (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: "Table data saved successfully" });
    }
  );
});

module.exports = router;
