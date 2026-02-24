# Travel Guide - Avolta Customer

Travel Guide web app with:
- static frontend pages
- Python backend APIs
- secure server-side login session
- agenda data loaded from Excel

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Python 3 (`ThreadingHTTPServer`)
- Excel parsing: `openpyxl`

## Project Structure
```text
.
|-- public/                 # UI pages and assets
|-- config/
|   |-- data/               # JSON data and credentials
|   `-- Agenda.xlsx         # Agenda source Excel
|-- server.py               # App server + APIs
|-- requirements.txt
`-- Procfile                # Cloud start command
```

## Local Run
1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start server:
```bash
python server.py
```

3. Open:
```text
http://localhost:8000
```

## Environment Variables
- `PORT` (default: `8000`)
- `HOST` (default: `0.0.0.0`)
- `COOKIE_SECURE` (`true`/`false`, default: `false`)
- `SESSION_TTL_MINUTES` (default: `480`)
- `LOGIN_MAX_ATTEMPTS` (default: `8`)
- `LOGIN_WINDOW_SECONDS` (default: `300`)

You can start from `.env.example` when setting environment values.

For cloud HTTPS deployments, set:
- `COOKIE_SECURE=true`

## API Endpoints
- `POST /api/login`
- `POST /api/logout`
- `GET /api/session`
- `GET /api/settings` (auth required)
- `GET /api/about` (auth required)
- `GET /api/places` (auth required)
- `GET /api/agenda` (auth required)
- `GET /api/health`

## Credentials Format
File: `config/data/credentials.json`

Supported formats:
1. Plain password (legacy):
```json
{
  "users": [
    { "username": "user1", "password": "pass1" }
  ]
}
```

2. PBKDF2 hash (recommended):
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

## Cloud Deployment
Any platform that supports Python web processes can run this project.

Start command:
```bash
python server.py
```

The app binds to `HOST`/`PORT` from environment, so no code change is needed between local and cloud.
