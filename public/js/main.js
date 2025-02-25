import { initializeApp } from "./modules/app-init.js";
import { handleFormSubmissions } from "./modules/form-handlers.js";
import { addEventListeners } from "./modules/event-listeners.js";
import { applyDarkMode } from "./modules/dark-mode.js";
import {
  fetchAndDisplayClubs,
  fetchAndDisplaySports,
  fetchAndDisplayAthletes,
  viewAthlete,
  toggleLoading,
} from "./modules/helpers.js";
import { fetchNotifications } from "./modules/notifications.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("App initialized");
  toggleLoading(true); // Show spinner on app open

  initializeApp();
  handleFormSubmissions();
  addEventListeners();
  applyDarkMode();
  fetchAndDisplayClubs(); // Fetch and display clubs
  fetchAndDisplaySports(); // Fetch and display sports
  fetchAndDisplayAthletes();
  fetchNotifications(); // Fetch notifications

  // Attach the toggleLoading function to the global window object
  window.toggleLoading = toggleLoading;

  // Hide spinner after initial load
  setTimeout(() => {
    toggleLoading(false);
  }, 2000);

  // Fetch and change title with random message after 3 seconds
  setTimeout(fetchAndChangeTitle, 3000);
});

// Function to handle search and filter
function handleSearchAndFilter() {
  const searchInput = document.getElementById("search").value.toLowerCase();
  const sportFilter = document
    .getElementById("sport-filter")
    .value.toLowerCase();
  const clubFilter = document.getElementById("club-filter").value.toLowerCase();

  console.log("Search input:", searchInput); // Log search input
  console.log("Sport filter:", sportFilter); // Log sport filter
  console.log("Club filter:", clubFilter); // Log club filter

  const filters = {};
  if (searchInput) filters.name = searchInput;
  if (sportFilter) filters.sport = sportFilter;
  if (clubFilter) filters.club = clubFilter;

  fetchAndDisplayAthletes(filters);
}

// Add event listeners for search and filters
document
  .getElementById("search")
  .addEventListener("input", debounce(handleSearchAndFilter, 300));
document
  .getElementById("sport-filter")
  .addEventListener("change", handleSearchAndFilter);
document
  .getElementById("club-filter")
  .addEventListener("change", handleSearchAndFilter);

// Add event listener for "View Profile" buttons
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("view-profile-button")) {
    toggleLoading(true); // Show spinner on "View Profile"
    const athleteId = e.target.getAttribute("data-id");
    setTimeout(() => {
      window.electron.ipcRenderer.send(
        "navigate",
        `athlete.html?id=${athleteId}`
      );
      toggleLoading(false);
    }, 1000); // Delay to show spinner
  } else if (e.target.classList.contains("view-all-button")) {
    toggleLoading(true); // Show spinner on "View All Results"
    setTimeout(() => {
      toggleLoading(false);
    }, 1000); // Delay to show spinner
  }
});

// Function to fetch and change title with random message
async function fetchAndChangeTitle() {
  try {
    const response = await fetch("../assets/messages.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const messages = data.messages;

    const randomIndex = Math.floor(Math.random() * messages.length);
    const newTitle = messages[randomIndex];

    changeTitle(newTitle);
  } catch (error) {
    console.error("Error fetching messages:", error);
  }
}

// Function to change title with animations
function changeTitle(newTitle) {
  const titleElem = document.getElementById("main-title");
  titleElem.style.opacity = 0; // Start fade-out
  setTimeout(() => {
    titleElem.textContent = newTitle;
    titleElem.style.opacity = 1; // Fade-in
  }, 1000); // Delay to complete fade-out
}

// Debounce function to prevent multiple triggers
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
