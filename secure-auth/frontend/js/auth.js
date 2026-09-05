// ==============================================
// js/auth.js — Frontend Authentication Logic
// ==============================================
// Handles: Register, Login, OTP verification

// ─────────────────────────────────────────────
// CONFIG: Change this if your backend runs on
// a different port
// ─────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api/auth";

// Stores the logged-in user's email (for OTP step)
let currentEmail = "";

// Countdown timer reference (so we can clear it)
let timerInterval = null;

// ─────────────────────────────────────────────
// HELPER: Show a message box (success or error)
// ─────────────────────────────────────────────
function showMessage(elementId, text, type = "error") {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.className = `message ${type}`;
  el.style.display = "block";
}

// ─────────────────────────────────────────────
// HELPER: Toggle loading state on a button
// ─────────────────────────────────────────────
function setLoading(btnTextId, spinnerId, isLoading) {
  document.getElementById(btnTextId).style.display = isLoading ? "none" : "block";
  document.getElementById(spinnerId).style.display = isLoading ? "block" : "none";
}

// ─────────────────────────────────────────────
// HELPER: Switch between Login and Register tabs
// ─────────────────────────────────────────────
function showTab(tab) {
  // Hide all form sections
  document.getElementById("form-login").style.display = "none";
  document.getElementById("form-register").style.display = "none";
  document.getElementById("form-otp").style.display = "none";

  // Remove active class from all tabs
  document.getElementById("tab-login").classList.remove("active");
  document.getElementById("tab-register").classList.remove("active");

  if (tab === "login") {
    document.getElementById("form-login").style.display = "flex";
    document.getElementById("tab-login").classList.add("active");
  } else {
    document.getElementById("form-register").style.display = "flex";
    document.getElementById("tab-register").classList.add("active");
  }
}

// ─────────────────────────────────────────────
// REGISTER: Handle new user signup
// ─────────────────────────────────────────────
async function handleRegister() {
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirmPassword = document.getElementById("reg-confirm").value;

  // Basic client-side check before sending to server
  if (!email || !password || !confirmPassword) {
    showMessage("reg-message", "Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("reg-message", "Passwords do not match.");
    return;
  }

  setLoading("reg-btn-text", "reg-spinner", true);

  try {
    // Send POST request to our backend
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, confirmPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      // Show success message and switch to login tab after 2 seconds
      showMessage("reg-message", "✓ " + data.message, "success");
      setTimeout(() => showTab("login"), 2000);
    } else {
      showMessage("reg-message", data.message);
    }
  } catch (error) {
    showMessage("reg-message", "Cannot connect to server. Is it running?");
  } finally {
    setLoading("reg-btn-text", "reg-spinner", false);
  }
}

// ─────────────────────────────────────────────
// LOGIN: Handle credential submission + OTP send
// ─────────────────────────────────────────────
async function handleLogin() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showMessage("login-message", "Please enter email and password.");
    return;
  }

  setLoading("login-btn-text", "login-spinner", true);

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Credentials valid! OTP has been sent.
      currentEmail = email;
      showOTPForm(email);
    } else {
      // Shows specific messages: "User not registered" or "Wrong password"
      showMessage("login-message", data.message);
    }
  } catch (error) {
    showMessage("login-message", "Cannot connect to server. Is it running?");
  } finally {
    setLoading("login-btn-text", "login-spinner", false);
  }
}

// ─────────────────────────────────────────────
// SHOW OTP FORM: Transition to OTP step
// ─────────────────────────────────────────────
function showOTPForm(email) {
  // Hide login form, show OTP form
  document.getElementById("form-login").style.display = "none";
  document.getElementById("form-otp").style.display = "flex";

  // Show which email the OTP was sent to
  document.getElementById("otp-email-display").textContent = email;

  // Focus first OTP input box
  document.getElementById("otp0").focus();

  // Start the 5-minute countdown
  startOTPTimer(5 * 60);
}

// ─────────────────────────────────────────────
// OTP TIMER: 5-minute countdown display
// ─────────────────────────────────────────────
function startOTPTimer(seconds) {
  if (timerInterval) clearInterval(timerInterval); // Clear any existing timer

  timerInterval = setInterval(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    // Format as MM:SS (e.g., "04:32")
    document.getElementById("timer-display").textContent =
      `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (seconds <= 0) {
      clearInterval(timerInterval);
      document.getElementById("timer-display").textContent = "Expired";
      showMessage("otp-message", "OTP has expired. Please go back and login again.");
    }

    seconds--;
  }, 1000);
}

// ─────────────────────────────────────────────
// OTP INPUT: Auto-advance to next box on input
// ─────────────────────────────────────────────
function otpNext(current, nextIndex) {
  // Only allow digits
  current.value = current.value.replace(/[^0-9]/g, "");

  // Move to next input if this one is filled
  if (current.value && nextIndex >= 0 && nextIndex <= 5) {
    document.getElementById(`otp${nextIndex}`).focus();
  }
}

// OTP INPUT: Go back on Backspace
function otpBack(event, current, prevIndex) {
  if (event.key === "Backspace" && !current.value && prevIndex >= 0) {
    document.getElementById(`otp${prevIndex}`).focus();
  }
}

// ─────────────────────────────────────────────
// VERIFY OTP: Submit OTP to backend
// ─────────────────────────────────────────────
async function handleVerifyOTP() {
  // Collect all 6 OTP digits
  const otp =
    document.getElementById("otp0").value +
    document.getElementById("otp1").value +
    document.getElementById("otp2").value +
    document.getElementById("otp3").value +
    document.getElementById("otp4").value +
    document.getElementById("otp5").value;

  if (otp.length !== 6) {
    showMessage("otp-message", "Please enter the complete 6-digit OTP.");
    return;
  }

  setLoading("otp-btn-text", "otp-spinner", true);

  try {
    const response = await fetch(`${API_BASE}/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: currentEmail, otp }),
    });

    const data = await response.json();

    if (response.ok) {
      // OTP verified! Store JWT token in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.user.email);

      showMessage("otp-message", "✓ Verified! Redirecting to dashboard...", "success");

      // Clear the timer and redirect
      clearInterval(timerInterval);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } else {
      showMessage("otp-message", data.message);
    }
  } catch (error) {
    showMessage("otp-message", "Cannot connect to server. Is it running?");
  } finally {
    setLoading("otp-btn-text", "otp-spinner", false);
  }
}

// ─────────────────────────────────────────────
// ON PAGE LOAD: Check if user is already logged in
// ─────────────────────────────────────────────
window.addEventListener("load", () => {
  const token = localStorage.getItem("token");
  if (token) {
    // User already has a token, send them to dashboard
    window.location.href = "/dashboard";
  }
});
