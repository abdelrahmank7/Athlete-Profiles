// Debounce function to limit rapid saves
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Function to load the custom table data from the server
async function loadCustomTableFromServer(athleteId) {
  try {
    const res = await fetch(`/api/athletes/${athleteId}/custom-table`);
    if (!res.ok) {
      throw new Error(`Failed to fetch custom table data: ${res.statusText}`);
    }
    const { customTable, tableHead } = await res.json();
    console.log("Loaded customTable data:", customTable);

    const customTableElement = document.getElementById("custom-table");
    const thead = customTableElement.querySelector("thead");
    const tbody = customTableElement.querySelector("tbody");
    tbody.innerHTML = ""; // Clear existing table data

    // Populate table head
    const headRow = thead.rows[0];
    if (tableHead) {
      tableHead.forEach((header, index) => {
        headRow.cells[index].textContent = header;
      });
    }

    if (customTable.length === 0) {
      console.warn("Custom table is empty.");
      return;
    }

    // Populate table body
    customTable.forEach((row) => {
      const newRow = tbody.insertRow();
      row.forEach((cellData) => {
        const newCell = newRow.insertCell();
        newCell.contentEditable = "true";
        newCell.textContent = cellData.text;
        if (cellData.backgroundColor) {
          newCell.style.backgroundColor = cellData.backgroundColor;
        }
        if (cellData.color) {
          newCell.style.color = cellData.color;
        }
        newCell.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          changeCellDesign(newCell);
        });
      });
      // Debounced save on cell edit
      newRow.addEventListener(
        "input",
        debounce(() => {
          saveTableToServer(athleteId);
        }, 500)
      );
    });
  } catch (error) {
    console.error("Error loading custom table data:", error);
  }
}

// Function to add a new row to the table
export async function addRowToTable(athleteId) {
  const customTable = document.getElementById("custom-table");
  const newRow = customTable.querySelector("tbody").insertRow();

  for (let i = 0; i < 4; i++) {
    const newCell = newRow.insertCell();
    newCell.contentEditable = "true";
    newCell.textContent = "";
    newCell.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      changeCellDesign(newCell);
    });
  }

  // Debounced save on cell edit
  newRow.addEventListener(
    "input",
    debounce(() => {
      saveTableToServer(athleteId);
    }, 500)
  );
}

// Function to save the entire table to the server
export async function saveTableToServer(athleteId) {
  const customTable = document.getElementById("custom-table");
  const tableHead = Array.from(customTable.querySelector("thead tr").cells).map(
    (cell) => cell.textContent.trim()
  );
  const tableRows = Array.from(customTable.querySelectorAll("tbody tr")).map(
    (tr) =>
      Array.from(tr.cells).map((td) => {
        const cellData = { text: td.textContent.trim() || "" };
        if (td.style.backgroundColor) {
          cellData.backgroundColor = td.style.backgroundColor;
        }
        if (td.style.color) {
          cellData.color = td.style.color;
        }
        return cellData;
      })
  );

  try {
    const response = await fetch(`/api/athletes/${athleteId}/custom-table`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableHead, tableRows }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Response from save table:", result);
  } catch (error) {
    console.error("Error saving table data:", error);
  }
}

// Function to change cell design to match the head
function changeCellDesign(cell) {
  cell.style.backgroundColor = "#3498db";
  cell.style.color = "white";
  cell.style.fontWeight = "bold";
  saveTableToServer(document.getElementById("athlete-id").value);
}

// Add row button handler
document
  .getElementById("add-row-button")
  .addEventListener("click", async () => {
    const athleteId = document.getElementById("athlete-id").value;
    await addRowToTable(athleteId);
  });

// Save all rows and head button handler
document
  .getElementById("save-all-button")
  .addEventListener("click", async () => {
    const athleteId = document.getElementById("athlete-id").value;
    await saveTableToServer(athleteId);
    alert("Table data saved successfully.");
  });

// Initialize custom table functionality
export function initializeCustomTable(athleteId) {
  loadCustomTableFromServer(athleteId);
}
