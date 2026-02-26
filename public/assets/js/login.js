// Show error message
function showError(message) {
    const errorElement = document.getElementById("errorMessage");
    errorElement.textContent = message;
    errorElement.classList.add("show");
    setTimeout(() => {
        errorElement.classList.remove("show");
    }, 5000);
}

function setupVideoExperience() {
    const loginVideoWrap = document.getElementById("loginVideoWrap");
    const loginBgVideo = document.getElementById("loginBgVideo");
    const playVideoButton = document.getElementById("playVideoButton");
    const replayVideoButton = document.getElementById("replayVideoButton");
    const continueButton = document.getElementById("continueButton");
    const toggleMuteButton = document.getElementById("toggleMuteButton");
    const loginContainer = document.getElementById("loginContainer");
    const usernameInput = document.getElementById("username");
    if (!loginVideoWrap || !loginBgVideo || !playVideoButton || !replayVideoButton || !continueButton || !toggleMuteButton || !loginContainer) return;
    let isMuted = true;

    const setStage = (stage) => {
        loginVideoWrap.classList.remove("initial-thumb", "video-ended", "video-fallback");
        if (stage === "initial") loginVideoWrap.classList.add("initial-thumb");
        if (stage === "ended") loginVideoWrap.classList.add("video-ended");
        if (stage === "fallback") loginVideoWrap.classList.add("video-fallback");
    };

    const syncMuteButton = () => {
        toggleMuteButton.classList.toggle("is-muted", isMuted);
        toggleMuteButton.setAttribute("aria-label", isMuted ? "Unmute video" : "Mute video");
        toggleMuteButton.setAttribute("title", isMuted ? "Unmute video" : "Mute video");
    };

    const showLoginCard = () => {
        loginBgVideo.pause();
        document.body.classList.add("login-open");
        loginContainer.classList.add("show");
        if (usernameInput) usernameInput.focus();
    };

    const playFromStart = async () => {
        document.body.classList.remove("login-open");
        loginContainer.classList.remove("show");
        setStage("playing");
        try {
            // Ensure metadata/source are ready before starting playback.
            loginBgVideo.load();
            loginBgVideo.currentTime = 0;
            loginBgVideo.muted = isMuted;
            await loginBgVideo.play();
        } catch (_error) {
            try {
                loginBgVideo.muted = isMuted;
                await loginBgVideo.play();
            } catch (_retryError) {
                setStage("fallback");
            }
        }
    };

    loginBgVideo.addEventListener("ended", () => {
        setStage("ended");
    });

    loginBgVideo.addEventListener("error", () => {
        setStage("fallback");
    });

    playVideoButton.addEventListener("click", playFromStart);
    replayVideoButton.addEventListener("click", playFromStart);
    continueButton.addEventListener("click", showLoginCard);
    toggleMuteButton.addEventListener("click", () => {
        isMuted = !isMuted;
        loginBgVideo.muted = isMuted;
        syncMuteButton();
    });

    loginBgVideo.muted = isMuted;
    syncMuteButton();
    setStage("initial");
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
            window.location.href = "dashboard.html";
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
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Login error:", error);
        showError("Unable to sign in. Please try again.");
    }
});

setupVideoExperience();
checkExistingSession();

