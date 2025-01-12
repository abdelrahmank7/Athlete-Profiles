const express = require("express");
const { athletesDb } = require("../models/database");
const router = express.Router();

// Delete a history record from an athlete
router.delete("/:athleteId/history/:recordId", (req, res) => {
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

module.exports = router;
