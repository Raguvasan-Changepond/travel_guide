// Customization entry points for non-technical users.
const SETTINGS_PATH = "api/settings";
const ABOUT_PATH = "api/about";
const PLACES_PATH = "api/places";

const state = {
  settings: null
};

// Initialize menu toggle
document.addEventListener('DOMContentLoaded', function() {
  const menuBtn = document.getElementById('menu-btn');
  const menuDropdown = document.getElementById('menu-dropdown');
  
  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      menuDropdown.classList.toggle('show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function() {
      menuDropdown.classList.remove('show');
    });
    
    // Close menu when clicking on menu items
    menuDropdown.addEventListener('click', function() {
      menuDropdown.classList.remove('show');
    });
  }
});

function safeHtml(text) {
  const div = document.createElement("div");
  div.innerText = text ?? "";
  return div.innerHTML;
}

async function getJson(path) {
  const res = await fetch(path, {
    cache: "no-store",
    credentials: "same-origin"
  });
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`);
  }
  return res.json();
}

function initWelcomeCelebration() {
  const canvas = document.getElementById("celebration-canvas");
  if (!canvas || canvas.dataset.running === "true") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.dataset.running = "true";

  const holiPalette = [
    "#ff4f8b",
    "#ff9f1a",
    "#ffd166",
    "#22c55e",
    "#14b8a6",
    "#38bdf8",
    "#8b5cf6",
    "#f43f5e"
  ];

  const pigmentParticles = [];
  const durationMs = 11500;
  const startAt = performance.now();
  let width = 0;
  let height = 0;
  let dpr = 1;
  let rafId = null;
  let lastBurstAt = 0;

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pickColor() {
    return holiPalette[Math.floor(Math.random() * holiPalette.length)];
  }

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnPowderBurst(originX, originY, intensity = 1) {
    const powderCount = Math.floor(randomBetween(95, 145) * intensity);
    for (let i = 0; i < powderCount; i += 1) {
      const angle = randomBetween(0, Math.PI * 2);
      const speed = randomBetween(0.9, 5.1) * intensity;
      const color = pickColor();
      pigmentParticles.push({
        x: originX + randomBetween(-5, 5),
        y: originY + randomBetween(-5, 5),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - randomBetween(0.1, 0.85),
        gravity: randomBetween(0.013, 0.045),
        drag: randomBetween(0.978, 0.992),
        size: randomBetween(1.4, 4.7),
        life: randomBetween(54, 118),
        maxLife: randomBetween(54, 118),
        color,
        alpha: randomBetween(0.5, 0.95)
      });
    }
  }

  function spawnSideThrow(leftSide = true) {
    const originX = leftSide ? width * 0.07 : width * 0.93;
    const originY = height * randomBetween(0.62, 0.84);
    const baseAngle = leftSide ? randomBetween(-0.95, -0.35) : randomBetween(-2.8, -2.2);
    const count = Math.floor(randomBetween(58, 92));

    for (let i = 0; i < count; i += 1) {
      const angle = baseAngle + randomBetween(-0.55, 0.55);
      const speed = randomBetween(1.6, 6.5);
      pigmentParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: randomBetween(0.016, 0.05),
        drag: randomBetween(0.979, 0.993),
        size: randomBetween(1.6, 4.2),
        life: randomBetween(50, 104),
        maxLife: randomBetween(50, 104),
        color: pickColor(),
        alpha: randomBetween(0.52, 0.9)
      });
    }
  }

  function drawPigmentParticle(particle) {
    const lifeRatio = Math.max(0, particle.life / particle.maxLife);
    ctx.globalAlpha = lifeRatio * particle.alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function stopAnimation() {
    if (rafId !== null) window.cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resizeCanvas);
    canvas.dataset.running = "false";
    ctx.clearRect(0, 0, width, height);
  }

  function tick(now) {
    if (canvas.dataset.running !== "true") {
      stopAnimation();
      return;
    }

    if (document.hidden) {
      rafId = window.requestAnimationFrame(tick);
      return;
    }

    const elapsed = now - startAt;
    if (elapsed < durationMs && now - lastBurstAt > 520) {
      const centerBurst = Math.random() > 0.45;
      if (centerBurst) {
        spawnPowderBurst(width * randomBetween(0.2, 0.82), height * randomBetween(0.16, 0.42), randomBetween(0.9, 1.25));
      } else {
        spawnSideThrow(Math.random() > 0.5);
      }
      lastBurstAt = now;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";

    for (let i = pigmentParticles.length - 1; i >= 0; i -= 1) {
      const particle = pigmentParticles[i];
      particle.vx *= particle.drag;
      particle.vy = (particle.vy * particle.drag) + particle.gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;

      if (particle.life <= 0 || particle.y > height + 48 || particle.x < -48 || particle.x > width + 48) {
        pigmentParticles.splice(i, 1);
        continue;
      }
      drawPigmentParticle(particle);
    }

    if (elapsed < durationMs || pigmentParticles.length > 0) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      stopAnimation();
    }
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  spawnPowderBurst(width * 0.24, height * 0.28, 1.2);
  spawnPowderBurst(width * 0.5, height * 0.2, 1.35);
  spawnPowderBurst(width * 0.76, height * 0.28, 1.2);
  spawnSideThrow(true);
  spawnSideThrow(false);
  rafId = window.requestAnimationFrame(tick);
}

function initWelcome() {
  const title = document.getElementById("welcome-title");
  if (title) title.textContent = `Welcome ${state.settings.clientName}`;
  initWelcomeCelebration();
  const startBtn = document.getElementById("start-tour");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
  }
}

function initDashboard() {
  const title = document.getElementById("header-title");
  if (title) title.textContent = "Welcome, Manuel and Ino";
}

async function initAbout() {
  const target = document.getElementById("about-content");
  if (!target) return;

  const about = await getJson(ABOUT_PATH);
  target.innerHTML = `
    <div class="about-grid">
      <div>
        <h2>${safeHtml(about.title)}</h2>
        <p>${safeHtml(about.summary)}</p>
        <h3>Highlights</h3>
        <ul>
          ${about.highlights.map((item) => `<li>${safeHtml(item)}</li>`).join("")}
        </ul>
        ${Array.isArray(about.history) && about.history.length ? `
          <h3>History of Chennai</h3>
          <ul>
            ${about.history.map((item) => `<li>${safeHtml(item)}</li>`).join("")}
          </ul>
        ` : ""}
      </div>
      <div class="about-images">
        ${about.images.map((img) => `<img src="${safeHtml(img.src)}" alt="${safeHtml(img.alt)}" />`).join("")}
      </div>
    </div>
  `;
}

function buildDirectionsUrl(destination) {
  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving"
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

async function initPlaces() {
  const wrap = document.getElementById("places-grid");
  if (!wrap) return;

  const places = await getJson(PLACES_PATH);
  wrap.innerHTML = `
    <div id="places-track" class="places-grid"></div>
  `;

  const dialog = document.getElementById("place-dialog");
  const closeDialog = document.getElementById("close-dialog");
  const dialogImage = document.getElementById("dialog-image");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogDescription = document.getElementById("dialog-description");
  const dialogGallery = document.getElementById("dialog-gallery");
  const dialogNotes = document.getElementById("dialog-notes");
  const directionLink = document.getElementById("direction-link");
  const track = document.getElementById("places-track");

  if (!track) return;

  if (closeDialog && dialog) {
    closeDialog.addEventListener("click", () => dialog.close());
  }

  places.forEach((place) => {
    const cardWrap = document.createElement("article");
    cardWrap.className = "place-item";
    const button = document.createElement("button");
    button.className = "place-card";
    button.type = "button";
    button.innerHTML = `
      <img src="${safeHtml(place.image)}" alt="${safeHtml(place.name)}" />
      <h2>${safeHtml(place.name)}</h2>
    `;
    button.addEventListener("click", () => {
      if (!dialog || !dialogImage || !dialogTitle || !dialogDescription || !directionLink || !dialogGallery || !dialogNotes) return;
      const gallerySource = Array.isArray(place.images) && place.images.length ? place.images : [place.image];
      const galleryImages = [...new Set(gallerySource.filter(Boolean))];
      dialogImage.src = galleryImages[0] || place.image;
      dialogImage.alt = place.name;
      dialogTitle.textContent = place.name;
      dialogDescription.textContent = place.description;
      dialogGallery.innerHTML = "";
      dialogGallery.hidden = galleryImages.length <= 1;
      if (!dialogGallery.hidden) {
        galleryImages.forEach((imgSrc, i) => {
          const thumb = document.createElement("button");
          thumb.type = "button";
          thumb.className = "dialog-thumb";
          if (i === 0) thumb.classList.add("is-active");
          thumb.innerHTML = `<img src="${safeHtml(imgSrc)}" alt="${safeHtml(place.name)} view ${i + 1}" />`;
          thumb.addEventListener("click", () => {
            dialogImage.src = imgSrc;
            dialogGallery.querySelectorAll(".dialog-thumb").forEach((n) => n.classList.remove("is-active"));
            thumb.classList.add("is-active");
          });
          dialogGallery.appendChild(thumb);
        });
      }
      const notes = Array.isArray(place.quickNotes) ? place.quickNotes : [];
      dialogNotes.innerHTML = notes.map((n) => `<li>${safeHtml(n)}</li>`).join("");
      directionLink.href = buildDirectionsUrl(place.destination);
      dialog.showModal();
    });
    cardWrap.appendChild(button);
    track.appendChild(cardWrap);
  });
}

function renderAgendaTable(rows, target, headers = null) {
  if (!rows || rows.length === 0) {
    target.innerHTML = "<p class='muted'>No data found in this sheet.</p>";
    return;
  }

  function formatAgendaCell(value) {
    const normalized = String(value ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/<br\s*\/?>/gi, "\n");
    return safeHtml(normalized).replace(/\n/g, "<br>");
  }

  // Use provided headers or extract from first row
  let columnHeaders = headers;
  if (!columnHeaders || columnHeaders.length === 0) {
    columnHeaders = Object.keys(rows[0]);
  }
  
  // Filter out empty/null headers
  columnHeaders = columnHeaders.filter(h => h && String(h).trim());
  const dateColumnPattern = /\bdate\b/i;
  const columnClassNames = columnHeaders.map((header) => {
    const normalizedHeader = String(header).trim();
    return dateColumnPattern.test(normalizedHeader) ? "agenda-col-date" : "";
  });
  const visibleRows = getNonEmptyAgendaRows(rows, columnHeaders);
  
  if (columnHeaders.length === 0 || visibleRows.length === 0) {
    target.innerHTML = "<p class='muted'>No data found in this sheet.</p>";
    return;
  }
  
  // Build table header
  const thead = `<thead><tr>${columnHeaders.map((c, index) => {
    const className = columnClassNames[index];
    const classAttr = className ? ` class="${className}"` : "";
    return `<th${classAttr}>${safeHtml(String(c))}</th>`;
  }).join("")}</tr></thead>`;
  
  // Build table body
  const tbody = `<tbody>${visibleRows.map((row) => {
    return `<tr>${columnHeaders.map((c, index) => {
      const value = row[c] ?? "";
      const className = columnClassNames[index];
      const classAttr = className ? ` class="${className}"` : "";
      return `<td${classAttr}>${formatAgendaCell(value)}</td>`;
    }).join("")}</tr>`;
  }).join("")}</tbody>`;
  
  target.innerHTML = `<table class="agenda-table">${thead}${tbody}</table>`;
}

function isAgendaValueEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

function getNonEmptyAgendaRows(rows, headers) {
  if (!Array.isArray(rows) || !Array.isArray(headers) || headers.length === 0) return [];
  return rows.filter((row) => headers.some((header) => !isAgendaValueEmpty(row ? row[header] : "")));
}

async function initAgenda() {
  const target = document.getElementById("agenda-table-wrap");
  if (!target) return;

  try {
    const res = await fetch("/api/agenda", {
      cache: "no-store",
      credentials: "same-origin"
    });
    if (!res.ok) throw new Error("Server not running. Start with: python server.py");
    const agendaData = await res.json();
    
    // Get all sheet names
    const sheetNames = Object.keys(agendaData);
    
    if (sheetNames.length === 0) {
      target.innerHTML = "<p class='muted'>No data found in agenda file.</p>";
      return;
    }

    // Create sheet navigation if multiple sheets
    let navHtml = "";
    if (sheetNames.length > 1) {
      navHtml = `<div class="agenda-sheet-nav">
        <label class="agenda-sheet-label">Sheet:</label>
        <div class="agenda-sheet-buttons">
          ${sheetNames.map((name, idx) => {
            const rowCount = getNonEmptyAgendaRows(agendaData[name].rows, agendaData[name].headers).length;
            return `<button type="button" class="agenda-sheet-btn ${idx === 0 ? 'active' : ''}" data-sheet="${idx}" title="${rowCount} rows">${safeHtml(name)}</button>`;
          }).join("")}
        </div>
      </div>`;
    }

    target.innerHTML = navHtml + `<div id="agenda-content" class="agenda-content-area"></div>`;

    const contentArea = document.getElementById("agenda-content");
    let currentSheetIndex = 0;

    function loadSheet(sheetIndex) {
      const sheetName = sheetNames[sheetIndex];
      const sheetData = agendaData[sheetName];
      
      // Display raw data with actual headers
      renderAgendaTable(sheetData.rows, contentArea, sheetData.headers);

      // Update sheet button active state
      document.querySelectorAll(".agenda-sheet-btn").forEach((btn, idx) => {
        btn.classList.toggle("active", idx === sheetIndex);
      });

      currentSheetIndex = sheetIndex;
    }

    // Add event listeners to sheet buttons
    document.querySelectorAll(".agenda-sheet-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sheetIndex = parseInt(btn.dataset.sheet, 10);
        loadSheet(sheetIndex);
      });
    });

    // Load first sheet initially
    loadSheet(0);
  } catch (err) {
    if (err.message === "AUTH_REQUIRED") return;
    target.innerHTML = `<p class='muted'>Unable to load agenda data. ${safeHtml(err.message)}</p>`;
    console.error("Agenda error:", err);
  }
}

async function bootstrap() {
  const page = document.body.dataset.page;

  try {
    state.settings = await getJson(SETTINGS_PATH);

    switch (page) {
      case "welcome":
        initWelcome();
        break;
      case "dashboard":
        initDashboard();
        break;
      case "about":
        await initAbout();
        break;
      case "places":
        await initPlaces();
        break;
      case "agenda":
        await initAgenda();
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(err);
    const fallback = document.querySelector("main");
    if (fallback) {
      fallback.innerHTML = `<section class='content-panel'><h2>Configuration Error</h2><p class='muted'>${safeHtml(err.message)}</p></section>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bootstrap();
});

window.addEventListener("pageshow", (event) => {
  if (!event.persisted) return;
  if (!document.body || document.body.dataset.page !== "welcome") return;

  const canvas = document.getElementById("celebration-canvas");
  if (canvas) {
    canvas.dataset.running = "false";
  }
  initWelcomeCelebration();
});







