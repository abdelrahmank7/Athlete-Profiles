import express from "express";
import { athletesDb } from "../models/database.js";

const router = express.Router();

// Save custom table data for an athlete
router.post("/:id/custom-table", (req, res) => {
  const { id } = req.params;
  const { tableData } = req.body;

  // If tableData is not provided, set it to an empty array
  const processedTableData = tableData
    ? JSON.stringify(tableData)
    : JSON.stringify([]);

  // Log incoming request data for debugging
  console.log(`Saving table data for athlete ID: ${id}`);
  console.log("Received table data:", tableData);

  athletesDb.run(
    `UPDATE athletes SET customTable = ? WHERE id = ?`,
    [processedTableData, id], // Ensure tableData is stringified
    (err) => {
      if (err) {
        console.error("Error saving table data:", err.message);
        return res.status(500).json({ error: "Failed to save table data" });
      }
      res.status(200).json({ message: "Table data saved successfully" });
    }
  );
});

export default router;
