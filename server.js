import express from "express";
import compression from "compression";
import bodyParser from "body-parser";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import session from "express-session";
import winston from "winston";
import expressWinston from "express-winston";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/routes.js"; // Import central router
import listEndpoints from "express-list-endpoints";

import cron from "node-cron"; // Import the cron module for google drive
import { sync } from "./sync.js"; // Import the sync function for google drive

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startExpressServer() {
  const app = express();
  const port = process.env.PORT || 3001; // Change the port number here

  // Middleware
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use(express.json());

  // Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: "Too many requests, please try again later.",
  });

  // Apply the rate limit to API routes only
  app.use("/api/", apiLimiter);

  // Helmet for Security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https:", "'unsafe-inline'"],
          styleSrc: ["'self'", "https:", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'", "http://localhost:3001", "app://localhost"],
          fontSrc: ["'self'", "https:", "data:"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    })
  );

  // Session handling
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "default_secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production" },
    })
  );

  // Logging with Winston
  app.use(
    expressWinston.logger({
      transports: [new winston.transports.Console()],
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
      ),
    })
  );

  // Serve static files
  app.use(express.static(path.join(__dirname, "public"), { maxAge: "0" }));

  app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"), { maxAge: "0" })
  );

  app.use(
    "/models/data",
    express.static(path.join(__dirname, "models/data"), { maxAge: "0" })
  );

  //cache control
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    next();
  });

  // Routes
  app.use("/api", routes); // Use central router

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/index.html"));
  });

  app.get("/athlete.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public/html/athlete.html"));
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error("Error Message:", err.message);
    res.status(500).send({
      status: "error",
      message: "Internal Server Error",
    });
  });

  // schedule sync every every hour
  cron.schedule("0 * * * *", () => {
    console.log("Running schedule sync...");
    sync().catch((error) => {
      console.error("Error during syncing data:", error);
    });
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Express server running on http://localhost:${port}`);
    console.log("Available Endpoints:");
    console.table(listEndpoints(app));
  });
}

// Initialize and start the server
startExpressServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1); // Ensure the process exits with an error code
});
