import express from "express";
import { athletesDb } from "../models/database.js";

const router = express.Router();

// Delete a history record from an athlete
router.delete("/:athleteId/history/:recordId", (req, res) => {
  const { athleteId, recordId } = req.params;

  athletesDb.update(
    { _id: athleteId },
    { $pull: { history: { _id: recordId } } },
    {},
    (err) => {
      if (err) {
        console.error("Error deleting history record:", err);
        return res
          .status(500)
          .json({ error: "Failed to delete history record" });
      }
      res.status(200).json({ message: "History record deleted successfully" });
    }
  );
});

export default router;
