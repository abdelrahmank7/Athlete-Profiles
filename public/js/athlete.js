import { initializeAthletePage } from "./modules/initializeAthletePage.js";

document.addEventListener("DOMContentLoaded", async () => {
  const athleteId = new URLSearchParams(window.location.search).get("id");
  console.log("Athlete ID from URL:", athleteId);

  if (!athleteId) {
    document.body.innerHTML =
      '<h1>Athlete not found. Please return to <a href="/">Home</a></h1>';
    return;
  }

  await initializeAthletePage(athleteId);

  // // Add save button click event listener
  // const saveButton = document.getElementById("save-button");
  // if (saveButton) {
  //   saveButton.addEventListener("click", async () => {
  //     console.log("Save button clicked");
  //     // We will implement the save functionality here step by step
  //   });
  // }
});
