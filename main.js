// const { app, BrowserWindow, protocol } = require("electron");
// const path = require("path");
// const express = require("express");
// const compression = require("compression");
// const bodyParser = require("body-parser");
// const morgan = require("morgan");
// const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
// const dotenv = require("dotenv");
// const redis = require("redis");
// const session = require("express-session");
// const RedisStore = require("connect-redis")(session); // Correct way to use connect-redis
// const winston = require("winston");
// const expressWinston = require("express-winston");

// // Load environment variables from .env file
// dotenv.config();

// // Redis client setup with proper creation
// const redisClient = redis.createClient({
//   url: process.env.REDIS_URL,
// });
// redisClient.connect().catch(console.error); // Ensure connection is established
// redisClient.on("error", (err) => console.log("Redis Client Error", err));

// function createWindow() {
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//       contextIsolation: true,
//       nodeIntegration: true,
//     },
//   });

//   mainWindow.loadFile(path.join(__dirname, "public/html/index.html"));
//   mainWindow.webContents.on("will-navigate", (event, url) => {
//     if (url.startsWith("file://")) {
//       event.preventDefault();
//       const relativeUrl = url.replace("file:///", "");
//       mainWindow.webContents.loadURL(`app://localhost/${relativeUrl}`);
//     }
//   });
//   mainWindow.maximize();
//   mainWindow.webContents.openDevTools();
// }

// function startExpressServer() {
//   const app = express();
//   const port = process.env.PORT || 4000;

//   // Middleware
//   app.use(compression());
//   app.use(bodyParser.json());
//   app.use(bodyParser.urlencoded({ extended: true }));

//   // Rate Limiting
//   const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//   });
//   app.use(limiter);

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
//       secret: process.env.SESSION_SECRET,
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

//   app.use(express.static(path.join(__dirname, "public"), { maxAge: "1d" }));

//   // Define routes
//   app.use("/api/athletes", require("./routes/athletes"));
//   app.use("/api/clubs", require("./routes/clubs"));
//   app.use("/api/sports", require("./routes/sports"));
//   app.use("/api/filters", require("./routes/filters"));
//   app.use("/api/notes", require("./routes/notes"));
//   app.use("/api/supplements", require("./routes/supplements"));
//   app.use("/api/appointments", require("./routes/appointments"));
//   app.use("/api/additional-info", require("./routes/additionalInfo"));
//   app.use("/api/history", require("./routes/history"));
//   app.use("/api/custom-table", require("./routes/customTable"));

//   app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "html", "index.html"));
//   });

//   app.get("/athlete.html", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "html", "athlete.html"));
//   });

//   // Error handling middleware
//   app.use((err, req, res, next) => {
//     console.error("Error Message:", err.message);
//     console.error("Error Stack:", err.stack);
//     res.status(500).send({
//       status: "error",
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   });

//   // Start the server
//   app.listen(port, () => {
//     console.log(`Express server running on http://localhost:${port}`);
//   });
// }

// app.whenReady().then(() => {
//   protocol.registerHttpProtocol("app", (request, callback) => {
//     const url = request.url.replace("app://", "http://localhost:4000/");
//     callback({ url });
//   });

//   startExpressServer();
//   createWindow();

//   app.on("activate", () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//       createWindow();
//     }
//   });
// });

// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });
