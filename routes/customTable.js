import express from "express";
import { v4 as uuidv4 } from "uuid";
import { athletesDb } from "../models/database.js";

const router = express.Router();

// Fetch custom table data for an athlete
router.get("/:athleteId/custom-table", (req, res) => {
  const { athleteId } = req.params;
  const query =
    "SELECT rowIndex, rowData FROM customTableRows WHERE athleteId = ? ORDER BY rowIndex";
  console.log(`Fetching custom table data for athlete: ${athleteId}`);

  athletesDb.all(query, [athleteId], (err, rows) => {
    if (err) {
      console.error("Error fetching custom table data:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to fetch custom table data" });
    }
    if (!rows.length) {
      console.warn(`Custom table data not found for athlete: ${athleteId}`);
      return res.status(404).json({ error: "Custom table data not found" });
    }
    try {
      console.log("Fetched rows from database:", rows);
      const customTable = rows.map((row) => JSON.parse(row.rowData));
      res.status(200).json({ customTable });
    } catch (parseError) {
      console.error("Error parsing custom table data:", parseError.message);
      res.status(500).json({ error: "Failed to parse custom table data" });
    }
  });
});

// Save a new row in the custom table for an athlete
router.post("/:athleteId/custom-table/row", (req, res) => {
  const { athleteId } = req.params;
  const { rowData } = req.body;

  if (!Array.isArray(rowData)) {
    return res.status(400).json({ error: "Invalid row data format" });
  }

  const newId = uuidv4();
  const rowIndexQuery =
    "SELECT MAX(rowIndex) as maxRowIndex FROM customTableRows WHERE athleteId = ?";
  const insertQuery =
    "INSERT INTO customTableRows (id, athleteId, rowIndex, rowData) VALUES (?, ?, ?, ?)";

  athletesDb.get(rowIndexQuery, [athleteId], (err, row) => {
    if (err) {
      console.error("Error fetching row index:", err.message);
      return res.status(500).json({ error: "Failed to fetch row index" });
    }
    const rowIndex = (row.maxRowIndex || 0) + 1;
    const processedRowData = JSON.stringify(rowData);

    athletesDb.run(
      insertQuery,
      [newId, athleteId, rowIndex, processedRowData],
      (err) => {
        if (err) {
          console.error("Error inserting new row data:", err.message);
          return res
            .status(500)
            .json({ error: "Failed to insert new row data" });
        }
        console.log(`New row added successfully for athlete: ${athleteId}`);
        res
          .status(200)
          .json({ message: "New row added successfully", rowIndex });
      }
    );
  });
});

// Save custom table data for an athlete (update an existing row)
router.put("/:athleteId/custom-table/row/:rowIndex", (req, res) => {
  const { athleteId, rowIndex } = req.params;
  const { rowData } = req.body;

  if (!Array.isArray(rowData)) {
    return res.status(400).json({ error: "Invalid row data format" });
  }

  const processedRowData = JSON.stringify(rowData);
  const query =
    "UPDATE customTableRows SET rowData = ? WHERE athleteId = ? AND rowIndex = ?";

  athletesDb.run(query, [processedRowData, athleteId, rowIndex], (err) => {
    if (err) {
      console.error("Error updating custom table row data:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to update custom table row data" });
    }
    console.log(
      `Row ${rowIndex} updated successfully for athlete: ${athleteId}`
    );
    res.status(200).json({ message: "Row updated successfully", rowIndex });
  });
});

export default router;
