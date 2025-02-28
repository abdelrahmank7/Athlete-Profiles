// routes/routes.js
import express from "express";
import athletesRoutes from "./athletes.js";
import clubsRoutes from "./clubs.js";
import sportsRoutes from "./sports.js";
import filtersRoutes from "./filters.js";
import notesRoutes from "./notes.js";
import supplementsRoutes from "./supplements.js";
import tournamentsRoutes from "./tournaments.js";
import historyRoutes from "./history.js";
import customTableRoutes from "./customTable.js";
import generalInfoRoutes from "./generalInfo.js";
import filesRoutes from "./files.js"; // Import the files route
import athletesManagementRoutes from "./athlete-management.js";
import notificationsRoutes from "./notifications.js";
import statisticsRoutes from "./statistics.js";
import exportRoutes from "./export.js";

const router = express.Router();

router.use("/athletes", athletesRoutes);
router.use("/clubs", clubsRoutes);
router.use("/sports", sportsRoutes);
router.use("/filters", filtersRoutes);
router.use("/athletes", notesRoutes);
router.use("/athletes", supplementsRoutes);
router.use("/athletes", tournamentsRoutes);
router.use("/athletes", historyRoutes);
router.use("/athletes", generalInfoRoutes);
router.use("/athletes", customTableRoutes);
router.use("/athletes", filesRoutes); // Use the files route
router.use("/athlete-management", athletesManagementRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/statistics", statisticsRoutes);
router.use("/export", exportRoutes);

export default router;
