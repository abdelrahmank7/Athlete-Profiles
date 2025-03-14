import {
  fetchAndDisplayAthletes,
  fetchAndDisplayClubs,
  fetchAndDisplaySports,
  showModal,
} from "./helpers.js";
import { validatePhoneNumber, savePhoneNumber } from "./phoneHandler.js";

export function handleFormSubmissions() {
  const athleteForm = document.getElementById("athlete-form");
  if (athleteForm) {
    athleteForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const athleteData = Object.fromEntries(formData.entries());

      const {
        name,
        birthdate,
        weight,
        targetWeight,
        height,
        club,
        sport,
        phoneNumber,
      } = athleteData;

      // Validate required fields
      if (
        !name ||
        !birthdate ||
        !weight ||
        !targetWeight ||
        !height ||
        !club ||
        !sport
      ) {
        showModal("All fields are required.");
        return;
      }

      // Validate phone number
      if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
        showModal("Invalid phone number format.");
        return;
      }

      try {
        // Save athlete data
        const response = await fetch("/api/athletes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(athleteData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          showModal(`Failed to add athlete: ${errorData.message}`);
          return;
        }

        const athlete = await response.json();

        // Save phone number if provided
        if (phoneNumber) {
          const saved = await savePhoneNumber(athlete.id, phoneNumber);
          if (!saved) {
            showModal("Failed to save phone number.");
          }
        }

        showModal("Athlete added successfully!");
        e.target.reset();
        await fetchAndDisplayAthletes();
      } catch (error) {
        console.error("Error adding athlete:", error);
        showModal("Error adding athlete.");
      }
    });
  }

  const clubForm = document.getElementById("club-form");
  if (clubForm) {
    clubForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const clubName = document.getElementById("club-name").value;
      try {
        const response = await fetch("/api/clubs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ club: clubName }),
        });
        if (response.ok) {
          showModal("Club added successfully!");
          document.getElementById("club-name").value = "";
          await fetchAndDisplayClubs();
        } else {
          const errorData = await response.json();
          showModal(`Failed to add club: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error adding club:", error);
        showModal("Error adding club.");
      }
    });
  }

  const sportForm = document.getElementById("sport-form");
  if (sportForm) {
    sportForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const sportName = document.getElementById("sport-name").value;
      try {
        const response = await fetch("/api/sports", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sport: sportName }),
        });
        if (response.ok) {
          showModal("Sport added successfully!");
          document.getElementById("sport-name").value = "";
          await fetchAndDisplaySports();
        } else {
          const errorData = await response.json();
          showModal(`Failed to add sport: ${errorData.message}`);
        }
      } catch (error) {
        console.error("Error adding sport:", error);
        showModal("Error adding sport.");
      }
    });
  }
}
