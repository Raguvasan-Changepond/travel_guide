# Travel Guide - Avolta Customer

Travel Guide is a secure, server-rendered static web app for customer visits in Chennai.
It serves frontend pages from `public/` and protected JSON/Excel-backed APIs from `server.py`.

## What This App Includes
- Login-protected experience with server-side sessions
- Welcome and dashboard flow
- About Chennai content from JSON
- Places carousel with image gallery and Google Maps directions link
- Agenda view loaded dynamically from Excel (`config/Agenda.xlsx`)
- Travel essentials page

## Tech Stack
- Python 3 (standard library HTTP server)
- `openpyxl==3.1.5`
- HTML, CSS, Vanilla JavaScript
- Google Fonts (`Source Sans 3` via CDN)

## Repository Structure
```text
.
|-- public/
|   |-- login.html
|   |-- index.html
|   |-- dashboard.html
|   |-- about.html
|   |-- places.html
|   |-- agenda.html
|   |-- travel-tips.html
|   `-- assets/
|       |-- css/styles.css
|       |-- js/app.js
|       |-- js/login.js
|       |-- images/
|       `-- audio/
|-- config/
|   |-- Agenda.xlsx
|   `-- data/
|       |-- settings.json
|       |-- about.json
|       |-- places.json
|       `-- credentials.json
|-- server.py
|-- requirements.txt
`-- Procfile
```

## Prerequisites
- Python 3.x
- `pip`

## Local Run
1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start server:
```bash
python server.py
```

3. Open in browser:
```text
http://localhost:8000
```

## Environment Variables
- `HOST` (default: `0.0.0.0`)
- `PORT` (default: `8000`)
- `COOKIE_SECURE` (`true/false`, default: `false`)
- `SESSION_TTL_MINUTES` (default: `480`)
- `LOGIN_MAX_ATTEMPTS` (default: `8`)
- `LOGIN_WINDOW_SECONDS` (default: `300`)

For HTTPS deployments, set:
- `COOKIE_SECURE=true`

## Authentication and Session Behavior
- Login endpoint validates username/password (max 15 chars each)
- Per-IP failed login rate limiting is enforced
- Session cookie is `HttpOnly` + `SameSite=Lax`
- Session cookie can be `Secure` when `COOKIE_SECURE=true`
- Protected endpoints return `401 Unauthorized` without a valid session

## API Endpoints
Public:
- `GET /api/health`
- `GET /api/session`
- `POST /api/login`
- `POST /api/logout`

Protected:
- `GET /api/settings`
- `GET /api/about`
- `GET /api/places`
- `GET /api/agenda`

## Data Configuration
### `config/data/settings.json`
Controls welcome text values and project metadata used by UI.

### `config/data/about.json`
Content source for the About Chennai page (title, summary, highlights, history, images).

### `config/data/places.json`
Content source for Places page (name, description, destination, primary image, optional image gallery, notes).

### `config/Agenda.xlsx`
Agenda source file read at runtime by backend.
- If a `Config` sheet exists, it is used to define visible columns per sheet.
- Hidden sheets are skipped.
- Empty rows are skipped.

### `config/data/credentials.json`
Credential source for login.
Supported user object formats:

1. Plain password:
```json
{
  "users": [
    { "username": "user1", "password": "pass1" }
  ]
}
```

2. PBKDF2 password hash (recommended):
```json
{
  "users": [
    {
      "username": "user1",
      "password_hash": "pbkdf2_sha256$120000$salt$hex_digest"
    }
  ]
}
```

## Deployment
`Procfile` start command:
```text
web: python server.py
```

The app binds using `HOST`/`PORT` environment variables, so the same code runs locally and in cloud process-based deployments.
