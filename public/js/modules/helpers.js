export function toggleLoading(show) {
  const loadingSpinner = document.getElementById("loading-spinner");
  const overlay = document.createElement("div");
  overlay.className = "spinner-overlay";
  overlay.id = "spinner-overlay";

  if (show) {
    if (loadingSpinner) {
      document.body.appendChild(overlay);
      overlay.appendChild(loadingSpinner); // Attach spinner to overlay
      loadingSpinner.style.display = "block";
    }
  } else {
    setTimeout(() => {
      const existingOverlay = document.getElementById("spinner-overlay");
      if (existingOverlay) existingOverlay.remove();
      if (loadingSpinner) {
        loadingSpinner.style.display = "none";
      }
    }, 1000); // Set delay to 1-2 seconds
  }
}

function addViewProfileButtonListeners() {
  const viewButtons = document.querySelectorAll(".view-profile-button");
  viewButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const athleteId = e.target.getAttribute("data-id");
      viewAthlete(athleteId);
    });
  });
}

function createAthleteCard(athlete) {
  const li = document.createElement("li");
  li.className = "athlete-card";
  li.innerHTML = `
    <div class="athlete-info">
      <h3>${athlete.name}</h3>
      <p>Sport: ${athlete.sport}</p>
      <p>Club: ${athlete.club}</p>
    </div>
    <button class="view-profile-button" data-id="${athlete.id}">View Profile</button>
  `;
  return li;
}

export async function fetchAndDisplayAthletes(filters = {}) {
  toggleLoading(true);
  try {
    console.log("Filters applied:", filters); // Log the applied filters
    const queryParams = new URLSearchParams(filters);
    const res = await fetch(`/api/athletes?${queryParams.toString()}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const athletes = await res.json(); // Directly parse the response as JSON
    console.log("Received athletes data:", athletes); // Log the received data

    if (!Array.isArray(athletes)) {
      console.error("Data is not an array:", athletes);
      return; // Exit the function if the data is not an array
    }

    // Reverse the athletes array so the most recent athlete is at the top
    const reversedAthletes = [...athletes].reverse(); // Use a shallow copy to avoid mutating the original array
    console.log("Reversed athletes data:", reversedAthletes); // Log the reversed athletes

    const results = document.getElementById("results");
    if (!results) {
      console.error("Error: results element not found.");
      return;
    }

    results.innerHTML = ""; // Clear existing results

    // Apply filters on the reversed array
    const filteredAthletes = reversedAthletes.filter((athlete) => {
      const matchesName = filters.name
        ? athlete.name.toLowerCase().includes(filters.name.toLowerCase())
        : true;
      const matchesSport = filters.sport
        ? athlete.sport.toLowerCase() === filters.sport.toLowerCase()
        : true;
      const matchesClub = filters.club
        ? athlete.club.toLowerCase() === filters.club.toLowerCase()
        : true;
      return matchesName && matchesSport && matchesClub;
    });

    console.log("Filtered athletes data:", filteredAthletes); // Log the filtered athletes

    // Display the first 4 athletes
    const athletesToDisplay = filteredAthletes.slice(0, 2);

    // Handle additional athletes if there are more than 4
    const additionalAthletes =
      filteredAthletes.length > 4 ? filteredAthletes.slice(2) : [];

    console.log("Athletes to display:", athletesToDisplay); // Log the athletes to display
    console.log("Additional athletes:", additionalAthletes); // Log additional athletes

    if (athletesToDisplay.length === 0) {
      results.innerHTML = "<p>No athletes found.</p>";
      return;
    }

    // Append athlete cards to the results container
    athletesToDisplay.forEach((athlete) => {
      results.appendChild(createAthleteCard(athlete));
    });

    // Add "View All" button if there are additional athletes
    if (additionalAthletes.length > 0) {
      const viewAllButton = document.createElement("button");
      viewAllButton.className = "view-all-button";
      viewAllButton.textContent = `View All Results (${additionalAthletes.length} more)`;
      viewAllButton.addEventListener("click", () =>
        showModal(filteredAthletes)
      );
      results.appendChild(viewAllButton);
    }

    // Add event listeners for "View Profile" buttons
    addViewProfileButtonListeners();
  } catch (error) {
    console.error("Error fetching athletes:", error);
  } finally {
    toggleLoading(false);
  }
}

export function viewAthlete(athleteId) {
  console.log(`View athlete profile for ID: ${athleteId}`);
  window.location.href = `/athlete.html?id=${athleteId}`;
}

async function fetchAndPopulateDropdown(url, dropdownIds) {
  toggleLoading(true);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    dropdownIds.forEach((id) => {
      const dropdown = document.getElementById(id);
      if (!dropdown) return console.error(`Dropdown ${id} not found`);

      dropdown.innerHTML = '<option value="" disabled selected>Select</option>';
      data.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        dropdown.appendChild(option);
      });
    });
  } catch (error) {
    console.error(`Error fetching data for dropdown: ${error}`);
  } finally {
    toggleLoading(false);
  }
}

export async function fetchAndDisplayClubs() {
  fetchAndPopulateDropdown("/api/clubs", ["club", "club-filter"]);
}

export async function fetchAndDisplaySports() {
  fetchAndPopulateDropdown("/api/sports", ["sport", "sport-filter"]);
}

export function showModal(content) {
  const modal = document.getElementById("alert-modal");
  const messageElem = document.getElementById("alert-message");

  if (!modal || !messageElem) return console.error("Modal elements not found");

  if (typeof content === "string") {
    messageElem.innerHTML = `<p>${content}</p>`;
  } else if (Array.isArray(content)) {
    const modalContent = content
      .map((athlete) => createAthleteCard(athlete).outerHTML)
      .join("");
    messageElem.innerHTML = modalContent;
  } else {
    console.error("Invalid content type for modal:", content);
    messageElem.innerHTML = "<p>Error: Invalid data received.</p>";
  }

  modal.style.display = "block";

  addViewProfileButtonListeners();

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
}
