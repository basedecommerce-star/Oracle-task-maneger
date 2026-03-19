# PDD Moldova — Telegram Mini App

Production-ready Telegram Mini App for preparing for the Moldova theoretical driving exam (ПДД Молдовы).

## Core Principle: Anti-Hallucination First

**No AI-generated content reaches users without verification.**

- LLM never determines correct answers
- LLM never rewrites question text for production
- LLM never publishes explanations without editor approval
- Every production question has an evidence bundle traceable to its source

## Architecture

```
┌─────────┐  ┌──────────┐  ┌───────────┐
│ Telegram │  │ Mini App  │  │   Admin   │
│   Bot    │  │ (Next.js) │  │  (Next.js)│
└────┬─────┘  └─────┬─────┘  └─────┬─────┘
     │              │              │
     └──────────────┼──────────────┘
                    │
              ┌─────▼─────┐
              │  NestJS    │
              │  REST API  │
              └─────┬──────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
  ┌─────▼───┐ ┌────▼────┐ ┌────▼──────┐
  │PostgreSQL│ │  Redis  │ │ S3/R2     │
  │          │ │ (BullMQ)│ │ (assets)  │
  └──────────┘ └────┬────┘ └───────────┘
                    │
     ┌──────────────┼──────────────┐
     │              │              │
┌────▼─────┐  ┌─────▼─────┐  ┌────▼──────┐
│HTML Parser│  │Visual/OCR │  │Reconciler │
│  Worker   │  │  Worker   │  │  Worker   │
└───────────┘  └───────────┘  └───────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind, TanStack Query, Zustand |
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Queue | BullMQ + Redis |
| Bot | Telegraf |
| Storage | S3 / Cloudflare R2 |
| Infra | Docker, docker-compose, Nginx |

## Directory Structure

```
├── packages/
│   ├── api/              # NestJS backend
│   │   ├── prisma/       # Schema + seed + migrations
│   │   ├── src/
│   │   │   ├── modules/  # auth, categories, topics, questions, exams, training, stats, rules, signs, admin, users, reports
│   │   │   ├── ingestion/# parsers, reconciler, validators, confidence scorer, pipeline
│   │   │   ├── common/   # guards, filters
│   │   │   ├── config/   # exam config constants
│   │   │   └── database/ # Prisma service
│   │   └── test/         # unit + integration + regression tests
│   ├── webapp/           # Next.js Telegram Mini App
│   ├── admin/            # Next.js admin panel
│   ├── bot/              # Telegraf Telegram bot
│   └── workers/
│       ├── parser-html/  # HTML/DOM extraction worker
│       ├── parser-visual/# OCR/visual extraction worker
│       └── reconciler/   # Diff & reconciliation worker
├── golden-dataset/       # Regression testing dataset
├── infrastructure/
│   └── nginx/            # Reverse proxy config
├── docs/                 # Architecture, API contract, ERD
├── docker-compose.yml
└── .env.example
```

## Quick Start

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your Telegram bot token and secrets

# 2. Start all services
docker-compose up -d

# 3. Run migrations and seed
docker-compose exec api npx prisma migrate dev
docker-compose exec api npx ts-node prisma/seed.ts
```

## Exam Configuration (Official ASP Parameters)

Stored in database, not in code. Default values from ASP:

| Categories | Questions | Duration | Pass Threshold | Max Errors |
|-----------|-----------|----------|---------------|------------|
| A, B, AM, A1, A2, B1 | 24 | 30 min | 22 correct | 2 |
| BE, C, CE, D, F | 30 | 38 min | 27 correct | 3 |
| CE, DE | 36 | 45 min | 32 correct | 4 |

## Ingestion Pipeline (8 Steps)

1. **Raw Capture** — Save source URL, HTML snapshot, screenshot, content hash
2. **Deterministic Extraction** — Parse HTML/DOM to extract questions, answers, correct markers
3. **Secondary Extraction** — Independent second parse (OCR/visual or alternate DOM parser)
4. **Diff Comparison** — Compare both extractions field-by-field
5. **Validation Rules** — Check min answers, correct answer count, no empty fields, valid category
6. **Confidence Scoring** — Score each field (text, answers, correct answer, explanation)
7. **Human Moderation** — Queue for review if confidence < 1.0 or conflicts exist
8. **Publish** — Only verified + approved content goes live

## Source Priority

| Level | Source | Usage |
|-------|--------|-------|
| **A** (Official) | ASP, government docs | Exam config, official content |
| **B** (Quasi-official) | auto-test.online, pdd-md.online | Ingest source, requires verification |
| **C** (Unofficial) | Forums, social media | Not used for production content |

## API Endpoints

### User-facing
- `POST /api/auth/telegram` — Authenticate via Telegram initData
- `GET /api/me` / `PATCH /api/me/settings`
- `GET /api/categories` / `GET /api/topics` / `GET /api/tickets`
- `POST /api/training/start` / `POST /api/training/:id/answer`
- `POST /api/exams/start` / `POST /api/exams/:id/answer` / `POST /api/exams/:id/finish`
- `GET /api/stats/overview`
- `GET /api/rules/search` / `GET /api/signs`
- `POST /api/questions/:id/report`

### Admin
- `POST /api/admin/import/source-snapshot`
- `POST /api/admin/parser/run`
- `GET /api/admin/conflicts`
- `POST /api/admin/questions/:id/approve` / `reject` / `publish`
- `GET /api/admin/evidence/:id`

## Golden Dataset & Regression Testing

The `golden-dataset/` directory contains verified question data for parser regression testing. Any parser update must achieve **100% exact match** on correct answers against the golden dataset before release.

```bash
cd packages/api && npx jest test/parser-regression.spec.ts
```

## Development

```bash
# Install dependencies per package
cd packages/api && npm install
cd packages/webapp && npm install
cd packages/admin && npm install
cd packages/bot && npm install

# Generate Prisma client
cd packages/api && npx prisma generate

# Run API in dev mode
cd packages/api && npm run start:dev

# Run webapp in dev mode
cd packages/webapp && npm run dev
```

## License

ISC