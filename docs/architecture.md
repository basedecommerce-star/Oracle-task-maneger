# Architecture

## System Overview

PDD Moldova is a multi-service application for preparing for the Moldova theoretical driving exam. It runs as a Telegram Mini App with a NestJS backend, PostgreSQL database, and a multi-stage content ingestion pipeline with anti-hallucination controls.

## Services

| Service | Technology | Port | Purpose |
|---------|-----------|------|---------|
| `api` | NestJS | 3001 | REST API backend |
| `webapp` | Next.js | 3000 | Telegram Mini App frontend |
| `admin` | Next.js | 3002 | Admin/moderation panel |
| `bot` | Telegraf | — | Telegram bot (polling) |
| `worker-parser-html` | BullMQ | — | HTML/DOM content parser |
| `worker-parser-visual` | BullMQ | — | Visual/OCR content parser |
| `worker-reconciler` | BullMQ | — | Diff & reconciliation engine |
| `db` | PostgreSQL 16 | 5432 | Primary database |
| `redis` | Redis 7 | 6379 | Job queue broker |
| `nginx` | Nginx | 80/443 | Reverse proxy |

## Data Flow

```
Source Website → Raw Capture → HTML Parser ─┐
                             → Visual Parser ┤
                                             ├→ Reconciler → Validator → Confidence Scorer
                                             │
                                             ├→ [conflict?] → Review Queue → Moderator
                                             │
                                             └→ [verified] → Published → User-facing API
```

## Anti-Hallucination Controls

1. **Dual-parser extraction**: Every question is parsed by at least two independent methods
2. **Diff comparison**: Field-by-field comparison detects discrepancies
3. **Confidence scoring**: Numerical confidence per field; auto-publish blocked if < 1.0
4. **Verification status gate**: Only `VERIFIED` or `PUBLISHED` content is served to users
5. **Evidence bundles**: Full provenance trail for every question
6. **Audit log**: Every moderation action is recorded
7. **Golden dataset regression**: Parser changes must pass 100% exact match on correct answers

## Security Model

- Telegram `initData` HMAC-SHA256 validation for user authentication
- JWT tokens for API session management
- Admin users with role-based access (SUPER_ADMIN, ADMIN, MODERATOR, VIEWER)
- Content never auto-published from non-official sources without moderation
