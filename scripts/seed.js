/**
 * Seeds the fighters table from data/fighters.js.
 * Run after setup-db: npm run seed
 */

require("dotenv").config();
const fighters = require("../data/fighters");
const { pool } = require("../db");

async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL in .env");
    process.exit(1);
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const fighter of fighters) {
      await client.query(
        `INSERT INTO fighters (slug, name, franchise, debut_smash, brief, image)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           franchise = EXCLUDED.franchise,
           debut_smash = EXCLUDED.debut_smash,
           brief = EXCLUDED.brief,
           image = EXCLUDED.image`,
        [
          fighter.slug,
          fighter.name,
          fighter.franchise,
          fighter.debutSmash,
          fighter.brief,
          fighter.image,
        ]
      );
    }

    await client.query("COMMIT");
    console.log(`Seeded ${fighters.length} fighters.`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to seed database:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
