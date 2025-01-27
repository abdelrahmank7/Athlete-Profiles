import express from "express";
import athletesRoutes from "./athletes.js";
import clubsRoutes from "./clubs.js";
import sportsRoutes from "./sports.js";
import filtersRoutes from "./filters.js";
import notesRoutes from "./notes.js";
import supplementsRoutes from "./supplements.js";
import tournamentsRoutes from "./tournaments.js";
// import additionalInfoRoutes from "./additionalInfo.js";
import historyRoutes from "./history.js"; // Ensure history routes are included
import customTableRoutes from "./customTable.js";
import generalInfoRoutes from "./generalInfo.js"; // Import the new generalInfo route

const router = express.Router();

router.use("/athletes", athletesRoutes);
router.use("/clubs", clubsRoutes);
router.use("/sports", sportsRoutes);
router.use("/filters", filtersRoutes);
router.use("/athletes", notesRoutes);
router.use("/athletes", supplementsRoutes);
router.use("/athletes", tournamentsRoutes);
// router.use("/additional-info", additionalInfoRoutes);
router.use("/athletes", historyRoutes); // Ensure history routes are included
router.use("/custom-table", customTableRoutes);
router.use("/athletes", generalInfoRoutes); // Add the new generalInfo route

export default router;
