import express from "express";
import { athletesDb } from "../models/database.js";

const router = express.Router();

// Save custom table data for an athlete
router.post("/:id/custom-table", (req, res) => {
  const { id } = req.params;
  const { tableData } = req.body;

  // Ensure tableData is properly stringified
  const processedTableData = JSON.stringify(tableData);

  // Log incoming request data for debugging
  console.log(`Saving table data for athlete ID: ${id}`);
  console.log("Processed table data:", processedTableData);

  athletesDb.run(
    `UPDATE athletes SET customTable = ? WHERE id = ?`,
    [processedTableData, id],
    (err) => {
      if (err) {
        console.error("Error saving table data:", err.message);
        return res.status(500).json({ error: "Failed to save table data" });
      }
      res.status(200).json({ message: "Table data saved successfully" });
    }
  );
});

// Fetch custom table data for an athlete (for debugging purposes)
router.get("/:id/custom-table", (req, res) => {
  const { id } = req.params;

  athletesDb.get(
    `SELECT customTable FROM athletes WHERE id = ?`,
    [id],
    (err, row) => {
      if (err) {
        console.error("Error fetching custom table data:", err.message);
        return res
          .status(500)
          .json({ error: "Failed to fetch custom table data" });
      }
      console.log("Fetched customTable data:", row.customTable);
      res.status(200).json(row);
    }
  );
});

export default router;
