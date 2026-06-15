/**
 * Creates the fighters table on your Render PostgreSQL database.
 * Run once: npm run setup-db
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool } = require("../db");

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("Missing DATABASE_URL in .env");
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  try {
    await pool.query(schemaSql);
    console.log("fighters table is ready.");
  } catch (err) {
    console.error("Failed to create table:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
