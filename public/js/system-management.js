import {
  fetchSystems,
  assignSystem,
  fetchAssignedSystem,
  generateWordFile,
} from "./modules/systemApi.js";

document.addEventListener("DOMContentLoaded", async () => {
  const systemSelect = document.getElementById("system-select");
  const assignSystemButton = document.getElementById("assign-system-button");
  const generateWordButton = document.getElementById("generate-word-button");
  const addSystemForm = document.getElementById("add-system-form");
  const systemList = document.getElementById("system-list");
  const loadingSpinner = document.getElementById("loading-spinner");

  // Show loading spinner
  const showLoading = () => {
    if (loadingSpinner) loadingSpinner.style.display = "flex";
  };

  // Hide loading spinner
  const hideLoading = () => {
    if (loadingSpinner) loadingSpinner.style.display = "none";
  };

  // Fetch and populate systems
  const populateSystems = async () => {
    try {
      showLoading();
      const systems = await fetchSystems();

      // Populate the system dropdown
      if (systemSelect) {
        systemSelect.innerHTML = ""; // Clear previous options
        systems.forEach((system) => {
          const option = document.createElement("option");
          option.value = system.id;
          option.textContent = `${system.type} - ${system.calories} cal`;
          systemSelect.appendChild(option);
        });
      }

      // Populate the system list
      if (systemList) {
        systemList.innerHTML = ""; // Clear previous list
        systems.forEach((system) => {
          const li = document.createElement("li");
          li.innerHTML = `
            ${system.name} (${system.type} - ${system.calories} cal)
            <button class="delete-system" data-id="${system.id}">Delete</button>
          `;
          systemList.appendChild(li);
        });
      }
    } catch (error) {
      alert("Failed to fetch systems. Please try again.");
      console.error(error);
    } finally {
      hideLoading();
    }
  };

  // Assign system to athlete
  if (assignSystemButton) {
    assignSystemButton.addEventListener("click", async () => {
      const athleteId = document.getElementById("athlete-select").value;
      const systemId = systemSelect.value;

      if (!athleteId || !systemId) {
        alert("Please select an athlete and a system.");
        return;
      }

      try {
        showLoading();
        await assignSystem(athleteId, systemId);
        alert("System assigned successfully!");
      } catch (error) {
        alert("Failed to assign system. Please try again.");
        console.error(error);
      } finally {
        hideLoading();
      }
    });
  }

  // Generate Word file
  if (generateWordButton) {
    generateWordButton.addEventListener("click", async () => {
      const athleteId = document.getElementById("athlete-select").value;
      const systemId = systemSelect.value;
      const sport = prompt("Enter the athlete's sport:");

      if (!athleteId || !systemId || !sport) {
        alert("Please select an athlete, a system, and enter a sport.");
        return;
      }

      try {
        showLoading();
        await generateWordFile(athleteId, systemId, sport);
        alert("Word file generated successfully!");
      } catch (error) {
        alert("Failed to generate Word file. Please try again.");
        console.error(error);
      } finally {
        hideLoading();
      }
    });
  }

  // Add a new system
  if (addSystemForm) {
    addSystemForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("system-name").value;
      const type = document.getElementById("system-type").value;
      const calories = document.getElementById("system-calories").value;

      if (!name || !type || !calories) {
        alert("All fields are required.");
        return;
      }

      try {
        await fetch("/systems/systems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type, calories }),
        });
        alert("System added successfully!");
        populateSystems(); // Refresh the system list
      } catch (error) {
        console.error("Error adding system:", error);
        alert("Failed to add system.");
      }
    });
  }

  // Remove a system
  if (systemList) {
    systemList.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete-system")) {
        const systemId = e.target.dataset.id;

        try {
          await fetch(`/systems/systems/${systemId}`, { method: "DELETE" });
          alert("System removed successfully!");
          populateSystems(); // Refresh the system list
        } catch (error) {
          console.error("Error removing system:", error);
          alert("Failed to remove system.");
        }
      }
    });
  }

  // Populate systems on page load
  await populateSystems();
});
