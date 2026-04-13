# cedict-sqlite-db

Converts the CC-CEDICT Chinese-English dictionary into a SQLite database.

## Prerequistes

- [Bun](https://bun.sh)

## Setup

```bash
bun install
```

- Input file: `cedict_ts.u8`
- Output file: `cedict.sqlite`

## Execution

```bash
bun convert.ts
```

## Database Schema

| Column       | Type   | Description                    |
|--------------|--------|--------------------------------|
| id           | INTEGER| Primary key                    |
| traditional  | TEXT   | Traditional Chinese characters |
| simplified   | TEXT   | Simplified Chinese characters  |
| pinyin       | TEXT   | Pinyin pronunciation           |
| definitions  | TEXT   | English definitions            |

Indexes are created on `simplified` and `traditional` columns for fast lookups.

## CEDICT Version

CC-CEDICT version 1.0 (2026-04-12), 124,869 entries

[MDBG source](https://www.mdbg.net/chinese/dictionary?page=cc-cedict)