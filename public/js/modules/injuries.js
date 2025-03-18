import { showModal } from "./helpers.js";

// Fetch injuries for an athlete
export async function fetchInjuries(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/injuries`);
    if (!res.ok) {
      throw new Error("Failed to fetch injuries");
    }
    const injuries = await res.json();
    injuries.forEach((injury) => {
      addInjuryToPage(athleteId, injury.injury, injury.date, injury.id);
    });
  } catch (error) {
    console.error("Error fetching injuries:", error);
  }
}

// Add an injury to the page
export function addInjuryToPage(athleteId, injury, date, injuryId = null) {
  const injuriesContent = document.getElementById("injuries-content");

  if (!injuriesContent) {
    console.error("injuries-content element not found");
    return;
  }

  const injuryElement = document.createElement("div");
  injuryElement.classList.add("injury-item");
  injuryElement.innerHTML = `
    <p class="injury-text"><span class="injury-content">${injury}</span></p><div class="button-container">
      <button class="edit-button"><img src="../assets/images/edit-icon.png" alt="Edit" /></button>
      <button class="remove-button"><img src="../assets/images/delete-icon.png" alt="Remove" /></button>
    </div>
  `;

  // Add hover effect with delay (Windows-style tooltip)
  const injuryText = injuryElement.querySelector(".injury-text");
  let hoverTimeout;

  injuryText.addEventListener("mouseenter", (e) => {
    hoverTimeout = setTimeout(() => {
      const tooltip = document.getElementById("date-tooltip");
      tooltip.textContent = date;
      tooltip.style.left = `${e.pageX + 10}px`; // Position near the mouse
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.display = "block";
    }, 1000); // 1-second delay
  });

  injuryText.addEventListener("mouseleave", () => {
    clearTimeout(hoverTimeout);
    document.getElementById("date-tooltip").style.display = "none";
  });

  // Add edit functionality
  injuryElement
    .querySelector(".edit-button")
    .addEventListener("click", (event) => {
      event.preventDefault();
      const injuryText = injuryElement.querySelector(".injury-text");
      const editButton = injuryElement.querySelector(".edit-button img");
      const originalDate = injuryText
        .querySelector(".injury-date")
        .getAttribute("data-date");

      if (injuryText.contentEditable === "true") {
        // Save changes
        injuryText.contentEditable = "false";
        editButton.src = "../assets/images/edit-icon.png";
        const injuryContent =
          injuryText.querySelector(".injury-content").textContent;
        if (injuryId) {
          updateInjuryOnServer(
            athleteId,
            injuryId,
            injuryContent,
            originalDate
          );
        }
      } else {
        // Enable editing
        injuryText.contentEditable = "true";
        injuryText.focus();
        editButton.src = "../assets/images/save-icon.png";
      }
    });

  // Add delete functionality
  injuryElement
    .querySelector(".remove-button")
    .addEventListener("click", async (event) => {
      event.preventDefault();
      if (injuryId) {
        await deleteInjuryFromServer(athleteId, injuryId);
        injuryElement.remove();
      }
    });

  // Insert the new injury at the beginning
  injuriesContent.insertBefore(injuryElement, injuriesContent.firstChild);
}

// Save the injury to the server
export async function saveInjuryToServer(athleteId, injury, date, callback) {
  try {
    const response = await fetch(`/api/athletes/${athleteId}/injuries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ injury, date }),
    });
    const result = await response.json();
    callback(result.id);
  } catch (error) {
    console.error("Error saving injury:", error);
  }
}

// Update the injury on the server
async function updateInjuryOnServer(athleteId, injuryId, injury, date) {
  try {
    const response = await fetch(
      `/api/athletes/${athleteId}/injuries/${injuryId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ injury, date }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update injury");
    }
  } catch (error) {
    console.error("Error updating injury:", error);
  }
}

// Delete the injury from the server
async function deleteInjuryFromServer(athleteId, injuryId) {
  try {
    const response = await fetch(
      `/api/athletes/${athleteId}/injuries/${injuryId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete injury");
    }
  } catch (error) {
    console.error("Error deleting injury:", error);
  }
}
