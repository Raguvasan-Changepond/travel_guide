function setupVideoExperience() {
    const loginVideoWrap = document.getElementById("loginVideoWrap");
    const loginBgVideo = document.getElementById("loginBgVideo");
    const playVideoButton = document.getElementById("playVideoButton");
    const replayVideoButton = document.getElementById("replayVideoButton");
    const continueButton = document.getElementById("continueButton");
    const toggleMuteButton = document.getElementById("toggleMuteButton");
    const skipVideoButton = document.getElementById("skipVideoButton");
    if (!loginVideoWrap || !loginBgVideo || !playVideoButton || !replayVideoButton || !continueButton || !toggleMuteButton) return;
    let isMuted = true;

    const setStage = (stage) => {
        loginVideoWrap.classList.remove("initial-thumb", "playing", "video-ended", "video-fallback");
        if (stage === "initial") loginVideoWrap.classList.add("initial-thumb");
        if (stage === "playing") loginVideoWrap.classList.add("playing");
        if (stage === "ended") loginVideoWrap.classList.add("video-ended");
        if (stage === "fallback") loginVideoWrap.classList.add("video-fallback");
    };

    const syncMuteButton = () => {
        toggleMuteButton.classList.toggle("is-muted", isMuted);
        toggleMuteButton.setAttribute("aria-label", isMuted ? "Unmute video" : "Mute video");
        toggleMuteButton.setAttribute("title", isMuted ? "Unmute video" : "Mute video");
    };

    const startTour = () => {
        window.location.href = "dashboard.html";
    };

    const playFromStart = async () => {
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
    continueButton.addEventListener("click", startTour);
    if (skipVideoButton) {
        skipVideoButton.addEventListener("click", () => {
            loginBgVideo.pause();
            setStage("ended");
        });
    }
    toggleMuteButton.addEventListener("click", () => {
        isMuted = !isMuted;
        loginBgVideo.muted = isMuted;
        syncMuteButton();
    });

    loginBgVideo.muted = isMuted;
    syncMuteButton();
    setStage("initial");
}

setupVideoExperience();

