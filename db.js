/**
 * PostgreSQL connection pool and query helpers.
 * Reads DATABASE_URL from the environment (.env locally, Render dashboard in production).
 */

require("dotenv").config();
const { Pool } = require("pg");

const isLocalDb =
  !process.env.DATABASE_URL ||
  process.env.DATABASE_URL.includes("localhost") ||
  process.env.DATABASE_URL.includes("127.0.0.1");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

function mapFighterRow(row) {
  return {
    slug: row.slug,
    name: row.name,
    franchise: row.franchise,
    debutSmash: row.debut_smash,
    brief: row.brief,
    image: row.image,
  };
}

async function getAllFighters() {
  const result = await pool.query(
    "SELECT slug, name, franchise, debut_smash, brief, image FROM fighters ORDER BY name"
  );
  return result.rows.map(mapFighterRow);
}

async function getFighterBySlug(slug) {
  const result = await pool.query(
    "SELECT slug, name, franchise, debut_smash, brief, image FROM fighters WHERE slug = $1",
    [slug]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return mapFighterRow(result.rows[0]);
}

module.exports = {
  pool,
  getAllFighters,
  getFighterBySlug,
};
