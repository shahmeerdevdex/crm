const loginEmailEl = document.getElementById("login-email");
const loginPasswordEl = document.getElementById("login-password");
const signupEmailEl = document.getElementById("signup-email");
const signupPasswordEl = document.getElementById("signup-password");
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginContainer = document.getElementById("login-container");
const signupContainer = document.getElementById("signup-container");
const mainContainer = document.getElementById("main");
const statusText = document.getElementById("status");
const statusSignupText = document.getElementById("status-signup");
const userEmail = document.getElementById("user-email");
const goToSignupLink = document.getElementById("go-to-signup");
const goToLoginLink = document.getElementById("go-to-login");

async function checkSession() {
  const {
    data: { session },
  } = await window.supabaseClient.auth.getSession();

  if (session) {
    loginContainer.classList.add("hidden");
    signupContainer.classList.add("hidden");
    mainContainer.classList.remove("hidden");
    userEmail.textContent = `Logged in as: ${session.user.email}`;
  } else {
    loginContainer.classList.remove("hidden");
    signupContainer.classList.add("hidden");
    mainContainer.classList.add("hidden");
  }
}

loginBtn.addEventListener("click", async () => {
  const { data, error } = await window.supabaseClient.auth.signInWithPassword({
    email: loginEmailEl.value,
    password: loginPasswordEl.value,
  });
  if (error) {
    statusText.textContent = `Login failed: ${error.message}`;
    statusText.style.color = "red";
  } else {
    statusText.style.color = "green";
    statusText.textContent = "✅ Login successful!";
    checkSession();
  }
});

signupBtn.addEventListener("click", async () => {
  const { data, error } = await window.supabaseClient.auth.signUp({
    email: signupEmailEl.value,
    password: signupPasswordEl.value,
  });
  if (error) {
    statusSignupText.style.color = "red";
    statusSignupText.textContent = `Signup failed: ${error.message}`;
  } else {
    statusSignupText.style.color = "green";
    statusSignupText.textContent = "✅ Signup successful!";
    checkSession();
  }
});

logoutBtn.addEventListener("click", async () => {
  await window.supabaseClient.auth.signOut();
  loginContainer.classList.remove("hidden");
  signupContainer.classList.add("hidden");
  mainContainer.classList.add("hidden");
  statusText.style.color = "red";
  statusText.textContent = "Logged out!";
});

goToSignupLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginContainer.classList.add("hidden");
  signupContainer.classList.remove("hidden");
});

goToLoginLink.addEventListener("click", (e) => {
  e.preventDefault();

  loginContainer.classList.remove("hidden");
  signupContainer.classList.add("hidden");
});

checkSession();

document.getElementById("goToUpwork").addEventListener("click", () => {
  chrome.tabs.create({ url: "https://www.upwork.com/nx/jobs/search/" });
});
