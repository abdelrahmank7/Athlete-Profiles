document.addEventListener("DOMContentLoaded", () => {
  const athleteTableBody = document
    .getElementById("athlete-table")
    .querySelector("tbody");
  const sortTournamentDateSelect = document.getElementById(
    "sort-tournament-date"
  );
  const clubSelect = document.getElementById("filter-club");
  const sportSelect = document.getElementById("filter-sport");
  const searchNameInput = document.getElementById("search-name");
  const searchButton = document.getElementById("search-button");

  const clubsStatisticsChart = document
    .getElementById("clubsStatisticsChart")
    .getContext("2d");
  const sportsStatisticsChart = document
    .getElementById("sportsStatisticsChart")
    .getContext("2d");

  // Initialize Chart.js for Clubs
  let clubsChart = new Chart(clubsStatisticsChart, {
    type: "pie",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce(
                (acc, value) => acc + value,
                0
              );
              const percentage =
                total > 0 ? ((context.raw / total) * 100).toFixed(2) : 0;
              return `${context.label}: ${context.raw} (${percentage}%)`;
            },
          },
        },
      },
    },
  });

  // Initialize Chart.js for Sports
  let sportsChart = new Chart(sportsStatisticsChart, {
    type: "pie",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce(
                (acc, value) => acc + value,
                0
              );
              const percentage =
                total > 0 ? ((context.raw / total) * 100).toFixed(2) : 0;
              return `${context.label}: ${context.raw} (${percentage}%)`;
            },
          },
        },
      },
    },
  });

  // Fetch and display statistics
  const fetchStatistics = async () => {
    try {
      const response = await fetch("/api/statistics");
      const stats = await response.json();

      // Club Distribution
      const clubsData = stats.clubsStats.map((stat) => stat.count);
      const clubsLabels = stats.clubsStats.map((stat) => stat.club);
      clubsChart.data.labels = clubsLabels;
      clubsChart.data.datasets[0].data = clubsData;
      clubsChart.data.datasets[0].backgroundColor = generateColors(
        clubsLabels.length
      );
      clubsChart.data.datasets[0].borderColor = generateColors(
        clubsLabels.length,
        true
      );
      clubsChart.update();

      // Sport Distribution
      const sportsData = stats.sportsStats.map((stat) => stat.count);
      const sportsLabels = stats.sportsStats.map((stat) => stat.sport);
      sportsChart.data.labels = sportsLabels;
      sportsChart.data.datasets[0].data = sportsData;
      sportsChart.data.datasets[0].backgroundColor = generateColors(
        sportsLabels.length
      );
      sportsChart.data.datasets[0].borderColor = generateColors(
        sportsLabels.length,
        true
      );
      sportsChart.update();
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const generateColors = (count, darken = false) => {
    const colors = [];
    for (let i = 0; i < count; i++) {
      let color = getRandomColor();
      if (darken) color = darkenColor(color);
      colors.push(color);
    }
    return colors;
  };

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const darkenColor = (color) => {
    let usePound = false;
    if (color[0] == "#") {
      color = color.slice(1);
      usePound = true;
    }
    let num = parseInt(color, 16);
    let r = (num >> 16) - 30;
    let b = ((num >> 8) & 0x00ff) - 30;
    let g = (num & 0x0000ff) - 30;
    let newColor = (g | (b << 8) | (r << 16)).toString(16);
    return (usePound ? "#" : "") + newColor;
  };

  // Fetch clubs and populate the dropdown
  const fetchClubs = async () => {
    try {
      const response = await fetch("/api/clubs");
      const clubs = await response.json();
      populateDropdown(clubSelect, clubs, "name", "All Clubs");
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  // Fetch sports and populate the dropdown
  const fetchSports = async () => {
    try {
      const response = await fetch("/api/sports");
      const sports = await response.json();
      populateDropdown(sportSelect, sports, "name", "All Sports");
    } catch (error) {
      console.error("Error fetching sports:", error);
    }
  };

  const populateDropdown = (dropdown, items, property, defaultOption) => {
    dropdown.innerHTML = `<option value="">${defaultOption}</option>`;
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item[property];
      option.textContent = item[property];
      dropdown.appendChild(option);
    });
  };

  // Fetch athletes based on filters and populate the table
  const fetchAthletes = async () => {
    try {
      const name = searchNameInput.value;
      const club = clubSelect.value;
      const sport = sportSelect.value;

      let url = "/api/athlete-management";
      const params = new URLSearchParams();
      if (name) params.append("name", name);
      if (club) params.append("club", club);
      if (sport) params.append("sport", sport);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      const athletes = await response.json();
      if (!Array.isArray(athletes)) {
        throw new Error("Expected an array of athletes");
      }
      populateAthleteTable(athletes);
    } catch (error) {
      console.error("Error fetching athletes:", error);
    }
  };

  const populateAthleteTable = (athletes) => {
    athleteTableBody.innerHTML = "";
    const sortedAthletes = sortAthletes(athletes);
    sortedAthletes.forEach((athlete) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${athlete.name}</td>
        <td>${athlete.club}</td>
        <td>${athlete.sport}</td>
        <td>${athlete.tournamentDate || "N/A"}</td>
        <td class="actions">
          <img src="../assets/images/delete-icon.png" alt="Delete" class="delete-icon" data-id="${
            athlete.id
          }">
          <img src="../assets/images/view-icon.png" alt="View Athlete" class="view-athlete" data-id="${
            athlete.id
          }">
        </td>
      `;
      athleteTableBody.appendChild(row);
    });
    addEventListeners();
  };

  const sortAthletes = (athletes) => {
    const sortValue = sortTournamentDateSelect.value;
    return athletes.sort((a, b) => {
      const dateA = a.tournamentDate ? new Date(a.tournamentDate) : null;
      const dateB = b.tournamentDate ? new Date(b.tournamentDate) : null;

      if (sortValue === "nearest") {
        if (dateA && dateB) {
          return dateA - dateB;
        } else if (dateA && !dateB) {
          return -1;
        } else if (!dateA && dateB) {
          return 1;
        } else {
          return 0;
        }
      } else {
        if (dateA && dateB) {
          return dateB - dateA;
        } else if (dateA && !dateB) {
          return 1;
        } else if (!dateA && dateB) {
          return -1;
        } else {
          return 0;
        }
      }
    });
  };

  const addEventListeners = () => {
    document.querySelectorAll(".delete-icon").forEach((icon) => {
      icon.addEventListener("click", async (event) => {
        const athleteId = event.target.getAttribute("data-id");
        const athleteName = event.target
          .closest("tr")
          .querySelector("td").textContent;

        // Show confirmation dialog
        const confirmed = confirm(
          `Are you sure you want to remove ${athleteName}?`
        );
        if (!confirmed) return; // Exit if the user cancels

        try {
          const response = await fetch(`/api/athlete-management/${athleteId}`, {
            method: "DELETE",
          });

          if (response.ok) {
            // Athlete successfully deleted
            alert(`${athleteName} has been successfully removed.`);
            fetchAthletes(); // Refresh the list of athletes
          } else if (response.status === 409) {
            // Athlete has tournaments and cannot be deleted
            const errorMessage = await response.text();
            alert(
              errorMessage ||
                "This athlete has tournaments and cannot be deleted."
            );
          } else if (response.status === 404) {
            // Athlete not found
            alert("Athlete not found.");
          } else {
            // Handle other errors
            console.error(`Failed to delete athlete: ${response.statusText}`);
            alert("An unexpected error occurred while deleting the athlete.");
          }
        } catch (error) {
          console.error("Error during deletion:", error);
          alert("An error occurred while trying to delete the athlete.");
        }
      });
    });

    document.querySelectorAll(".view-athlete").forEach((button) => {
      button.addEventListener("click", (event) => {
        const athleteId = event.target.getAttribute("data-id");
        window.location.href = `/athlete.html?id=${athleteId}`; // Redirect to athlete profile page with ID
      });
    });

    sortTournamentDateSelect.addEventListener("change", fetchAthletes);
    searchButton.addEventListener("click", fetchAthletes);
  };

  // Fetch and display statistics on page load
  fetchStatistics();
  fetchClubs();
  fetchSports();
  fetchAthletes();
});
