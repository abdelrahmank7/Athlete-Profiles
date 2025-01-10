const Datastore = require("nedb");
const path = require("path");

// Define the paths to your database files
const athletesDbPath = path.join(__dirname, "athletes.db");
const clubsAndSportsDbPath = path.join(__dirname, "clubsAndSports.db");

// Initialize the databases
const athletesDb = new Datastore({ filename: athletesDbPath, autoload: true });
const clubsAndSportsDb = new Datastore({
  filename: clubsAndSportsDbPath,
  autoload: true,
});

// Clear the athletes database
athletesDb.remove({}, { multi: true }, (err, numRemoved) => {
  if (err) {
    console.error("Error clearing athletes database:", err);
  } else {
    console.log("Athletes database cleared:", numRemoved, "documents removed");
  }
});

// Clear the clubs and sports database
clubsAndSportsDb.remove({}, { multi: true }, (err, numRemoved) => {
  if (err) {
    console.error("Error clearing clubs and sports database:", err);
  } else {
    console.log(
      "Clubs and sports database cleared:",
      numRemoved,
      "documents removed"
    );
  }
});
