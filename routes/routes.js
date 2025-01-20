import express from "express";
import athletesRoutes from "./athletes.js";
import clubsRoutes from "./clubs.js";
import sportsRoutes from "./sports.js";
import filtersRoutes from "./filters.js";
import notesRoutes from "./notes.js";
import supplementsRoutes from "./supplements.js";
import tournamentsRoutes from "./tournaments.js"; // Import the tournaments routes
import additionalInfoRoutes from "./additionalInfo.js";
import historyRoutes from "./history.js";
import customTableRoutes from "./customTable.js";

const router = express.Router();

router.use("/athletes", athletesRoutes);
router.use("/clubs", clubsRoutes);
router.use("/sports", sportsRoutes);
router.use("/filters", filtersRoutes);
router.use("/athletes", notesRoutes); // Ensure notes routes are under athletes
router.use("/athletes", supplementsRoutes); // Adjusted to nest supplements under athletes
router.use("/athletes", tournamentsRoutes); // Add tournaments routes
router.use("/additional-info", additionalInfoRoutes);
router.use("/history", historyRoutes);
router.use("/custom-table", customTableRoutes);

export default router;
