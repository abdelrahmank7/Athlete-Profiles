// import express from "express";
// import compression from "compression";
// import bodyParser from "body-parser";
// import morgan from "morgan";
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";
// import dotenv from "dotenv";
// import { createClient as createRedisClient } from "redis";
// import session from "express-session";
// import connectRedis from "connect-redis";
// import winston from "winston";
// import expressWinston from "express-winston";
// import path from "path";
// import { fileURLToPath } from "url";
// import { dirname } from "path";

// // Load environment variables
// dotenv.config();

// // Initialize Redis client
// const redisClient = createRedisClient({
//   url: process.env.REDIS_URL,
// });
// redisClient.on("error", (err) => console.error("Redis Client Error:", err));

// async function initializeRedis() {
//   try {
//     await redisClient.connect();
//     console.log("Connected to Redis");
//   } catch (err) {
//     console.error("Redis connection error:", err);
//   }
// }
// initializeRedis();

// const RedisStore = connectRedis(session);

// async function startExpressServer() {
//   const app = express();
//   const port = process.env.PORT || 4000;

//   // Middleware
//   app.use(compression());
//   app.use(bodyParser.json());
//   app.use(bodyParser.urlencoded({ extended: true }));
//   app.use(morgan("dev"));

//   // Rate Limiting
//   app.use(
//     rateLimit({
//       windowMs: 15 * 60 * 1000, // 15 minutes
//       max: 100, // limit each IP to 100 requests per windowMs
//     })
//   );

//   // Helmet for Security
//   app.use(
//     helmet({
//       contentSecurityPolicy: {
//         directives: {
//           defaultSrc: ["'self'"],
//           scriptSrc: ["'self'", "https:", "'unsafe-inline'"],
//           styleSrc: ["'self'", "https:", "'unsafe-inline'"],
//           imgSrc: ["'self'", "data:"],
//           connectSrc: ["'self'", "http://localhost:4000", "app://localhost"],
//           fontSrc: ["'self'", "https:", "data:"],
//           objectSrc: ["'none'"],
//           upgradeInsecureRequests: [],
//         },
//       },
//     })
//   );

//   // Session handling with Redis
//   app.use(
//     session({
//       store: new RedisStore({ client: redisClient }),
//       secret: process.env.SESSION_SECRET || "default_secret",
//       resave: false,
//       saveUninitialized: false,
//       cookie: { secure: process.env.NODE_ENV === "production" },
//     })
//   );

//   // Logging with Winston
//   app.use(
//     expressWinston.logger({
//       transports: [new winston.transports.Console()],
//       format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.json()
//       ),
//     })
//   );

//   // Serve static files
//   const __filename = fileURLToPath(import.meta.url);
//   const __dirname = dirname(__filename);
//   app.use(express.static(path.join(__dirname, "public"), { maxAge: "1d" }));

//   // Routes
//   try {
//     app.use("/api/athletes", (await import("./routes/athletes.js")).default);
//     app.use("/api/clubs", (await import("./routes/clubs.js")).default);
//     app.use("/api/sports", (await import("./routes/sports.js")).default);
//     app.use("/api/filters", (await import("./routes/filters.js")).default);
//     app.use("/api/notes", (await import("./routes/notes.js")).default);
//     app.use(
//       "/api/supplements",
//       (await import("./routes/supplements.js")).default
//     );
//     app.use(
//       "/api/appointments",
//       (await import("./routes/appointments.js")).default
//     );
//     app.use(
//       "/api/additional-info",
//       (await import("./routes/additionalInfo.js")).default
//     );
//     app.use("/api/history", (await import("./routes/history.js")).default);
//     app.use(
//       "/api/custom-table",
//       (await import("./routes/customTable.js")).default
//     );
//   } catch (err) {
//     console.error("Error loading routes:", err);
//   }

//   app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public/html/index.html"));
//   });

//   app.get("/athlete.html", (req, res) => {
//     res.sendFile(path.join(__dirname, "public/html/athlete.html"));
//   });

//   // Error handling middleware
//   app.use((err, req, res, next) => {
//     console.error("Error Message:", err.message);
//     res.status(500).send({
//       status: "error",
//       message: "Internal Server Error",
//     });
//   });

//   // Start the server
//   app.listen(port, () => {
//     console.log(`Express server running on http://localhost:${port}`);
//   });
// }

// // Initialize and start the server
// startExpressServer().catch((err) => {
//   console.error("Failed to start server:", err);
// });
