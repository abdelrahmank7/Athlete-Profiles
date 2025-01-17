import express from "express";
import { athletesDb } from "../models/database.js";

const router = express.Router();

// Save custom table data for an athlete
router.post("/:id/custom-table", (req, res) => {
  const { id } = req.params;
  const { tableData } = req.body;

  if (!tableData) {
    return res.status(400).json({ error: "Table data is required" });
  }

  athletesDb.update(
    { _id: id },
    { $set: { customTable: tableData } },
    {},
    (err) => {
      if (err) {
        console.error("Error saving table data:", err);
        return res.status(500).json({ error: "Failed to save table data" });
      }
      res.status(200).json({ message: "Table data saved successfully" });
    }
  );
});

export default router;
