import { Database } from "bun:sqlite";
import { convert as convertPinyin } from "pinyin-pro";

const INPUT_FILE = "cedict_ts.u8";
const DB_NAME = "cedict.sqlite";

async function runConversion() {
  const db = new Database(DB_NAME);

  // 1. Setup the Schema
  db.run("DROP TABLE IF EXISTS dict");
  db.run(`
    CREATE TABLE dict (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      traditional TEXT,
      simplified TEXT,
      pinyin TEXT,
      pinyinNumber TEXT,
      definitions TEXT
    )
  `);

  // 2. Load the file
  const file = Bun.file(INPUT_FILE);
  const text = await file.text();
  const lines = text.split("\n");

  console.log(`Processing ${lines.length} lines...`);

  // 3. Prepare the insertion statement
  const insert = db.prepare(`
    INSERT INTO dict (traditional, simplified, pinyin, pinyinNumber, definitions) 
    VALUES ($trad, $simp, $pinyin, $pinyinNum, $defs)
  `);

  // 4. Run as a transaction for massive speed gains
  const transaction = db.transaction((data) => {
    for (const entry of data) {
      insert.run(entry);
    }
  });

  const entryRegex = /^(\S+)\s+(\S+)\s+\[([^\]]+)\]\s+\/(.*)\//;
  const batch = [];

  for (const line of lines) {
    if (line.startsWith("#") || !line.trim()) continue;

    const match = line.match(entryRegex);
    if (match) {
      const [, trad, simp, pinyin, rawDefs] = match;
      const pinyinAccented = convertPinyin(pinyin ?? "").replaceAll("5", "");
      batch.push({
        $trad: trad,
        $simp: simp,
        $pinyin: pinyinAccented,
        $pinyinNum: pinyin,
        $defs: (rawDefs ?? "").replace(/\//g, "; "),
      });
    }
  }

  // Execute transaction
  transaction(batch);

  // 5. Add indexes for fast lookups
  db.run("CREATE INDEX idx_simplified ON dict(simplified)");
  db.run("CREATE INDEX idx_traditional ON dict(traditional)");

  console.log(`Done! Created ${DB_NAME}`);
  db.close();
}

runConversion();