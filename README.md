# Codia

Beautiful code images for humans and APIs.

Codia turns source code into crisp images for docs, blogs, social posts, and automation. It provides a browser playground at `/try-it`, a render API, lightweight render statistics, and an `llms.txt` endpoint for agent-facing documentation.

## Features

- Interactive `/try-it` playground with language, theme, background, padding, width, line-number, copy, and download controls.
- `POST /v1/code/render` API for generating code images from JSON payloads.
- SQLite-backed render records for usage stats.
- OpenAPI documentation at `/docs`.
- Docker Compose and OVO deployment scripts.

## Requirements

- Node.js 24
- npm
- SQLite-compatible filesystem access

## Development

```bash
npm ci
npm run dev
```

The app runs on `http://localhost:3000` by default.

Useful commands:

```bash
npm run typecheck
npm run build
npm start
```

## Environment

```env
PORT=3000
DATABASE_DIR=/root/apps/codia/databases
```

`DATABASE_DIR` is the directory where Codia stores `codia.sqlite`.

For Docker Compose, `DATABASE_DIR` is treated as the host persistence directory and is mounted into the container at `/app/databases`.

## Docker

```bash
docker compose up -d --build
```

With a custom database directory:

```bash
DATABASE_DIR=/root/apps/codia/databases docker compose up -d --build
```

## API

Render a code image:

```bash
curl -X POST http://localhost:3000/v1/code/render \
  -H "content-type: application/json" \
  -d '{
    "language": "typescript",
    "theme": "dracula",
    "code": "console.log(\"hello codia\")",
    "bgColor": "#0f172a",
    "borderSize": 12,
    "containerWidth": 600,
    "showLineNumbers": true
  }'
```

More details are available at `/docs` and `/llms.txt`.

## Deployment

The repository includes an OVO release workflow and deploy scripts under `scripts/ovo`.

The main deployment variable for database persistence is:

```env
DATABASE_DIR=/root/apps/codia/databases
```

The application always creates the directory if needed and stores the SQLite file as `codia.sqlite`.
