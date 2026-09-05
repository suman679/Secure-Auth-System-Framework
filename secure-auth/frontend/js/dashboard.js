// ==============================================
// js/dashboard.js — Dashboard Page Logic
// ==============================================
// This runs on the dashboard page after login

const API_BASE = "http://localhost:5000/api/auth";

// ─────────────────────────────────────────────
// ON PAGE LOAD: Verify the user is authenticated
// If no token exists → redirect to login
// ─────────────────────────────────────────────
window.addEventListener("load", async () => {
  const token = localStorage.getItem("token");

  // If no token, user isn't logged in
  if (!token) {
    window.location.href = "/";
    return;
  }

  // Set the login time
  const loginTime = new Date().toLocaleString();
  document.getElementById("dash-logintime").textContent = loginTime;

  try {
    // Call the protected dashboard API route
    // We send the JWT token in the Authorization header
    const response = await fetch(`${API_BASE}/dashboard`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,  // JWT must be sent here
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Token is valid — populate the dashboard
      document.getElementById("dash-email").textContent = data.user.email;

      // Format the account creation date nicely
      const createdDate = new Date(data.user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      document.getElementById("dash-created").textContent = createdDate;

    } else {
      // Token is invalid or expired
      alert("Session expired. Please login again.");
      handleLogout();
    }
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    alert("Could not connect to server.");
  }
});

// ─────────────────────────────────────────────
// LOGOUT: Clear token and redirect to login
// ─────────────────────────────────────────────
function handleLogout() {
  // Remove all stored auth data
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");

  // Redirect to login page
  window.location.href = "/";
}
