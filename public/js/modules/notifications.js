export const fetchNotifications = async () => {
  const notificationsList = document.getElementById("notifications-list");
  notificationsList.innerHTML = ""; // Clear existing notifications
  try {
    const response = await fetch("/api/notifications");
    const notifications = await response.json();
    console.log("Received notifications:", notifications); // Log the received notifications

    if (Array.isArray(notifications)) {
      if (notifications.length === 0) {
        console.log("No notifications found.");
        notificationsList.innerHTML = "<li>No upcoming tournaments.</li>";
        return;
      }

      // Sort notifications by the nearest date
      notifications.sort(
        (a, b) => new Date(a.tournamentDate) - new Date(b.tournamentDate)
      );

      notifications.forEach((notification) => {
        const tournamentDate = new Date(notification.tournamentDate);
        const today = new Date();
        const timeDiff = tournamentDate - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const emoji = daysDiff <= 7 ? "🚨" : "⚠️";
        const listItem = document.createElement("li");
        listItem.innerHTML = `
          <a href="/athlete.html?id=${notification.athleteId}" class="notification-link">
            <div class="notification-content">
              ${notification.athleteName} has a tournament on ${notification.tournamentDate}
            </div>
            <span class="emoji">${emoji}</span>
          </a>
        `;
        notificationsList.appendChild(listItem);
      });
    } else {
      console.error("Error: Expected an array of notifications");
      alert("Failed to load notifications. Please try again.");
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    alert("Failed to load notifications. Please try again.");
  }
};
