# Golden Dataset

## Purpose

The golden dataset provides a curated set of known-good question entries used for **regression testing** of HTML and visual parsers. When parsers are updated or refactored, tests run against this dataset to ensure output still matches the expected structured format.

## Format

Entries are stored as JSON arrays in `.json` files and must conform to the schema defined in [`schema.json`](./schema.json).

### Fields

| Field | Type | Description |
|---|---|---|
| `id` | string (UUID) | Unique identifier for the entry |
| `external_source_id` | string | Identifier from the original data source |
| `category_code` | string | Driving licence category (`A`, `B`, `AM`, `A1`, `A2`, `B1`, `BE`, `C`, `CE`, `D`, `DE`, `F`) |
| `ticket_number` | integer | Ticket/question number (≥ 1) |
| `topic_code` | string | Topic classification code |
| `language` | string | Language code (`ru` or `ro`) |
| `question_text` | string | The question text (min 10 characters) |
| `image_url` | string \| null | URL to an associated image, or `null` |
| `answers` | array | Array of answer objects (minimum 2) |
| `answers[].text` | string | Answer text (min 1 character) |
| `answers[].order` | integer | Display order (≥ 1) |
| `answers[].is_correct` | boolean | Whether this answer is correct |
| `explanation_text` | string \| null | Explanation of the correct answer, or `null` |
| `rule_reference` | string \| null | Reference to the relevant rule, or `null` |
| `source_url` | string (URI) | URL of the original source page |
| `source_hash` | string | Hash of the source content at time of capture |

## Adding New Entries

1. Source question data **only** from verified official sources.
2. Create a new JSON object matching the schema.
3. Generate a unique UUID v4 for the `id` field.
4. Compute `source_hash` from the raw source content (e.g. SHA-256 of the HTML body).
5. Validate your entry against the schema:
   ```bash
   npx ajv-cli validate -s golden-dataset/schema.json -d golden-dataset/your-file.json
   ```
6. Add the entry to an existing dataset file or create a new one.

## Running Regression Tests

Run the parser regression test suite against the golden dataset:

```bash
# Validate all dataset files against the schema
npx ajv-cli validate -s golden-dataset/schema.json -d "golden-dataset/*.json" --spec=draft7

# Run parser regression tests (from project root)
npm test -- --grep "golden-dataset"
```

The regression tests will:
1. Load each golden dataset entry.
2. Run the parser(s) against the `source_url` (or cached source).
3. Compare parsed output to the expected fields in the dataset entry.
4. Report any mismatches as test failures.

## Important Notes

- **All question text must be sourced from verified official data only.** Do not fabricate or paraphrase exam content.
- Placeholder entries (see [`sample.json`](./sample.json)) exist only to demonstrate the schema structure and must be replaced with real verified data before use in production tests.
