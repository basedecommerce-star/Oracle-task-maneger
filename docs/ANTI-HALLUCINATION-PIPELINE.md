# Anti-hallucination pipeline

## Core rule
No question, answer, explanation, or exam configuration may be shown to end users unless it has a verifiable source trail and an explicit verification status.

## Source priority
1. Official ASP and legal sources
2. Secondary public training sites
3. User reports and unsupported sources

## Processing stages
1. Capture raw source snapshot
2. Deterministic HTML extraction
3. Visual/OCR extraction
4. Reconciliation and diffing
5. Confidence scoring
6. Human moderation
7. Publish only verified records

## Evidence bundle
Each published question must have:
- source URL
- source snapshot reference
- parser outputs
- parser diff state
- moderator approval record

## Production policy
Only `verified` and `published` content may be returned by public APIs.
