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
  recordId = null
) {
  const historyContent = document.getElementById("history-content");
  const historyElement = document.createElement("div");
  const formattedDate = date || new Date().toISOString().split("T")[0];

  historyElement.innerHTML = `
    <p class="history-text">${formattedDate}: Weight: ${weight} kg, Fats: ${fats}%, Muscle: ${muscle}%</p>
    <div class="button-container">
      <button class="edit-button"><img src="../assets/images/edit-icon.png" alt="Edit" /></button>
      <button class="remove-button"><img src="../assets/images/delete-icon.png" alt="Remove" /></button>
    </div>
  `;
  historyContent.appendChild(historyElement);

  // Add event listener for the remove button
  historyElement
    .querySelector(".remove-button")
    .addEventListener("click", async (event) => {
      event.preventDefault();
      if (recordId) {
        await deleteHistoryRecordFromServer(athleteId, recordId);
      }
      historyElement.remove();
    });

  // Add event listener for the edit button
  historyElement
    .querySelector(".edit-button")
    .addEventListener("click", (event) => {
      event.preventDefault();
      const historyText = historyElement.querySelector(".history-text");
      const editButton = historyElement.querySelector(".edit-button img");

      if (historyText.contentEditable === "true") {
        historyText.contentEditable = "false";
        editButton.src = "../assets/images/edit-icon.png";
        if (recordId) {
          updateHistoryRecordOnServer(
            athleteId,
            recordId,
            historyText.textContent
          );
        }
      } else {
        historyText.contentEditable = "true";
        historyText.focus();
        editButton.src = "../assets/images/save-icon.png";
      }
    });

  if (!recordId) {
    saveHistoryRecordToServer(athleteId, date, weight, fats, muscle, (id) => {
      recordId = id;
    });
  }
}

// Helper functions for history operations
export async function saveHistoryRecordToServer(
  athleteId,
  date,
  weight,
  fats,
  muscle,
  callback
) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, weight, fats, muscle }),
    });
    const result = await res.json();
    callback(result.id);
  } catch (error) {
    console.error("Error saving history record:", error);
  }
}

export async function deleteHistoryRecordFromServer(athleteId, recordId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/history/${recordId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete history record");
    }
    console.log("Deleted history record with ID:", recordId);
  } catch (error) {
    console.error("Error deleting history record:", error);
  }
}

async function updateHistoryRecordOnServer(athleteId, recordId, historyText) {
  console.log("History Text:", historyText); // Debug log

  const match = historyText.match(
    /^(.*): Weight: (\d+(?:\.\d+)?) kg, Fats: (\d+(?:\.\d+)?)%, Muscle: (\d+(?:\.\d+)?)%$/
  );
  if (!match) {
    console.error("Error parsing history text content:", historyText);
    return;
  }

  const [, date, weight, fats, muscle] = match;
  console.log("Parsed Date:", date);
  console.log("Parsed Weight:", weight);
  console.log("Parsed Fats:", fats);
  console.log("Parsed Muscle:", muscle);

  try {
    await fetch(`/api/athletes/${athleteId}/history/${recordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, weight, fats, muscle }),
    });
  } catch (error) {
    console.error("Error updating history record:", error);
  }
}
