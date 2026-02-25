// Show error message
function showError(message) {
    const errorElement = document.getElementById("errorMessage");
    errorElement.textContent = message;
    errorElement.classList.add("show");
    setTimeout(() => {
        errorElement.classList.remove("show");
    }, 5000);
}

function setupLoginCardToggle() {
    const loginContainer = document.getElementById("loginContainer");
    const toggleCardButton = document.getElementById("toggleCardButton");
    const usernameInput = document.getElementById("username");

    if (!loginContainer || !toggleCardButton) return;

    const setCardState = (isVisible) => {
        loginContainer.classList.toggle("show", isVisible);
        toggleCardButton.classList.toggle("is-card-open", isVisible);
        toggleCardButton.setAttribute("aria-label", isVisible ? "Hide sign in card" : "Show sign in card");
        toggleCardButton.setAttribute("title", isVisible ? "Hide sign in card" : "Show sign in card");
        if (isVisible && usernameInput) usernameInput.focus();
    };

    setCardState(false);
    toggleCardButton.addEventListener("click", () => {
        const isVisible = !loginContainer.classList.contains("show");
        setCardState(isVisible);
    });
}

function setupVideoControls() {
    const loginVideoWrap = document.getElementById("loginVideoWrap");
    const loginBgVideo = document.getElementById("loginBgVideo");
    const toggleMuteButton = document.getElementById("toggleMuteButton");
    if (!loginVideoWrap || !loginBgVideo || !toggleMuteButton) return;

    const syncMuteLabel = () => {
        toggleMuteButton.classList.toggle("is-muted", loginBgVideo.muted);
        const label = loginBgVideo.muted ? "Unmute video" : "Mute video";
        toggleMuteButton.setAttribute("aria-label", label);
        toggleMuteButton.setAttribute("title", label);
    };

    loginBgVideo.addEventListener("error", () => {
        loginVideoWrap.classList.add("video-fallback");
    });

    loginBgVideo.addEventListener("ended", () => {
        loginVideoWrap.classList.add("video-ended");
    });

    toggleMuteButton.addEventListener("click", () => {
        loginBgVideo.muted = !loginBgVideo.muted;
        syncMuteLabel();
    });

    syncMuteLabel();
}

async function checkExistingSession() {
    try {
        const response = await fetch("/api/session", {
            method: "GET",
            cache: "no-store",
            credentials: "same-origin"
        });

        if (!response.ok) return;

        const payload = await response.json();
        if (payload.authenticated) {
            sessionStorage.setItem("isLoggedIn", "true");
            sessionStorage.setItem("currentUser", payload.currentUser || "");
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Session check failed:", error);
    }
}

// Handle form submission
document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username) {
        showError("Username cannot be empty.");
        return;
    }

    if (!password) {
        showError("Password cannot be empty.");
        return;
    }

    // Enforce maximum length of 15 characters
    if (username.length > 15) {
        showError("Username must be 15 characters or fewer.");
        return;
    }

    if (password.length > 15) {
        showError("Password must be 15 characters or fewer.");
        return;
    }

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({ username, password })
        });

        let payload = {};
        try {
            payload = await response.json();
        } catch (_err) {
            payload = {};
        }

        if (!response.ok) {
            showError(payload.error || "Unable to sign in. Please try again.");
            document.getElementById("password").value = "";
            return;
        }

        // Keep existing tab-level flags for current UI behavior.
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("currentUser", payload.currentUser || username);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Login error:", error);
        showError("Unable to sign in. Please try again.");
    }
});

setupLoginCardToggle();
setupVideoControls();
checkExistingSession();

