// Fetch history records for the athlete
export async function fetchHistory(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/history`);
    if (!res.ok) {
      throw new Error("Failed to fetch history records");
    }
    const historyRecords = await res.json();
    historyRecords.forEach((record) => {
      addHistoryRecordToPage(
        athleteId,
        record.date,
        record.weight,
        record.fats,
        record.muscle,
        record.water, // Ensure water is passed
        record.id
      );
    });
  } catch (error) {
    console.error("Error fetching history records:", error);
  }
}

// Helper function to add a history record to the page
export function addHistoryRecordToPage(
  athleteId,
  date,
  weight,
  fats,
  muscle,
  water, // Add water parameter
  recordId = null
) {
  const historyContent = document.getElementById("history-content");

  if (!historyContent) {
    console.error("history-content element not found");
    return;
  }

  const historyElement = document.createElement("div");
  const formattedDate = date || new Date().toISOString().split("T")[0];

  // Create the HTML structure with hidden date and water
  historyElement.innerHTML = `
    <p class="history-text"><span class="history-content">Weight: ${weight} kg, Fats: ${fats}%, Muscle: ${muscle} kg, Water: ${water} L</span><span class="history-date" data-date="${formattedDate}"></span></p>
    <div class="button-container">
      <button class="edit-button"><img src="../assets/images/edit-icon.png" alt="Edit" /></button>
      <button class="remove-button"><img src="../assets/images/delete-icon.png" alt="Remove" /></button>
    </div>
  `;

  // Add hover effect with delay (Windows-style tooltip)
  const historyText = historyElement.querySelector(".history-text");
  let hoverTimeout;

  historyText.addEventListener("mouseenter", (e) => {
    hoverTimeout = setTimeout(() => {
      const tooltip = document.getElementById("date-tooltip");
      tooltip.textContent = formattedDate;
      tooltip.style.left = `${e.pageX + 10}px`; // Position near the mouse
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.display = "block";
    }, 1000); // 1-second delay
  });

  historyText.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimeout);
    document.getElementById("date-tooltip").style.display = "none";
  });

  // Fix edit functionality to preserve all fields
  historyElement
    .querySelector(".edit-button")
    .addEventListener("click", (event) => {
      event.preventDefault();
      const historyText = historyElement.querySelector(".history-text");
      const editButton = historyElement.querySelector(".edit-button img");
      const originalDate = historyText
        .querySelector(".history-date")
        .getAttribute("data-date");
      const originalWater = water || "N/A"; // Preserve water value

      if (historyText.contentEditable === "true") {
        // Save changes
        historyText.contentEditable = "false";
        editButton.src = "../assets/images/edit-icon.png";
        const [weightPart, fatsPart, musclePart, waterPart] = historyText
          .querySelector(".history-content")
          .textContent.split(",")
          .map((part) => part.trim().split(": ")[1]);
        if (recordId) {
          updateHistoryRecordOnServer(
            athleteId,
            recordId,
            originalDate, // Preserve original date
            weightPart.replace(" kg", ""),
            fatsPart.replace("%", ""),
            musclePart.replace(" kg", ""),
            waterPart.replace(" L", "") || originalWater // Preserve water if not changed
          );
        }
      } else {
        // Enable editing
        historyText.contentEditable = "true";
        historyText.focus();
        editButton.src = "../assets/images/save-icon.png";
      }
    });

  // Add delete functionality
  historyElement
    .querySelector(".remove-button")
    .addEventListener("click", async (event) => {
      event.preventDefault();
      if (recordId) {
        await deleteHistoryRecordFromServer(athleteId, recordId);
        historyElement.remove();
      }
    });

  // Insert the new record at the beginning
  historyContent.insertBefore(historyElement, historyContent.firstChild);
}

// Helper functions for history operations
export async function saveHistoryRecordToServer(
  athleteId,
  date,
  weight,
  fats,
  muscle,
  water, // Add water parameter
  callback
) {
  try {
    const response = await fetch(`/api/athletes/${athleteId}/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        weight,
        fats,
        muscle,
        water, // Include water in the request
      }),
    });
    const result = await response.json();
    callback(result.id); // Ensure callback is called
  } catch (error) {
    console.error("Error saving history record:", error);
  }
}

export async function deleteHistoryRecordFromServer(athleteId, recordId) {
  try {
    const response = await fetch(
      `/api/athletes/${athleteId}/history/${recordId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete history record");
    }
  } catch (error) {
    console.error("Error deleting history record:", error);
  }
}

export async function updateHistoryRecordOnServer(
  athleteId,
  recordId,
  date,
  weight,
  fats,
  muscle,
  water // Add water parameter
) {
  try {
    const response = await fetch(
      `/api/athletes/${athleteId}/history/${recordId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          weight,
          fats,
          muscle,
          water, // Include water in the request
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update history record");
    }
  } catch (error) {
    console.error("Error updating history record:", error);
  }
}
