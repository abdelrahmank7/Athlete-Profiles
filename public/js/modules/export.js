// Export the save button functionality
export const initializeSaveButton = () => {
  const saveButton = document.getElementById("save-button");
  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      try {
        // Show loading feedback
        saveButton.disabled = true;
        saveButton.textContent = "Saving...";
        const athleteId = new URLSearchParams(window.location.search).get("id");

        if (!athleteId) {
          alert("Athlete ID not found.");
          return;
        }

        console.log(`Exporting data for athlete ID: ${athleteId}`);
        // Step 1: Export athlete data as a SQLite database file
        const exportResponse = await fetch(`/api/export/${athleteId}`, {
          method: "POST",
        });

        if (!exportResponse.ok) {
          const errorMessage = await exportResponse.text();
          console.error(`Server response: ${errorMessage}`);
          alert(`Failed to export athlete data: ${errorMessage}`);
          saveButton.disabled = false;
          saveButton.textContent = "Save";
          return;
        }

        const exportData = await exportResponse.json();
        console.log("Data exported successfully:", exportData.filePath);

        alert("All data has been saved successfully.");

        // Reset button state
        saveButton.disabled = false;
        saveButton.textContent = "Save";
      } catch (error) {
        console.error("Error during save process:", error);
        alert("An unexpected error occurred while saving the athlete data.");
        saveButton.disabled = false;
        saveButton.textContent = "Save";
      }
    });
  }
};
