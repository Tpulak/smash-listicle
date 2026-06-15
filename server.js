/**
 * BACKEND — Express server
 *
 * This file handles all routes (URLs) and sends HTML pages to the browser.
 * Fighter data is loaded from the PostgreSQL database (see db.js).
 */

const express = require("express");
const path = require("path");
const fs = require("fs");
const { getAllFighters, getFighterBySlug } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files (CSS, local images) from the public/ folder
app.use(express.static(path.join(__dirname, "public")));

/**
 * Reads an HTML template from views/ and replaces {{placeholders}} with values.
 * Example: renderTemplate("index.html", { TITLE: "Hello" })
 */
function renderTemplate(filename, variables) {
  const templatePath = path.join(__dirname, "views", filename);
  let html = fs.readFileSync(templatePath, "utf8");

  for (const [key, value] of Object.entries(variables)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  return html;
}

/**
 * ROUTE: Home page — lists all fighters
 * URL: http://localhost:3000/
 */
app.get("/", async (req, res) => {
  try {
    const fighters = await getAllFighters();

    const fightersListHtml = fighters
      .map(
        (fighter) => `
      <article class="fighter-card">
        <img src="${fighter.image}" alt="${fighter.name}" class="fighter-image" />
        <h3><a href="/fighters/${fighter.slug}">${fighter.name}</a></h3>
        <p><strong>Franchise:</strong> ${fighter.franchise}</p>
        <p><strong>Debut:</strong> ${fighter.debutSmash}</p>
        <p>${fighter.brief}</p>
        <a href="/fighters/${fighter.slug}" role="button" class="secondary">View details</a>
      </article>
    `
      )
      .join("");

    const html = renderTemplate("index.html", {
      TITLE: "Super Smash Bros. Fighter Guide",
      FIGHTER_COUNT: fighters.length,
      FIGHTERS_LIST: fightersListHtml,
    });

    res.send(html);
  } catch (err) {
    console.error("Failed to load fighters:", err.message);
    res.status(500).send("Could not load fighters from the database.");
  }
});

/**
 * ROUTE: Fighter detail page — shows all fields for one character
 * URL: http://localhost:3000/fighters/mario
 */
app.get("/fighters/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const fighter = await getFighterBySlug(slug);

    if (!fighter) {
      const html = renderTemplate("404.html", {
        MESSAGE: `No fighter found for "${slug}".`,
      });
      return res.status(404).send(html);
    }

    const html = renderTemplate("detail.html", {
      NAME: fighter.name,
      FRANCHISE: fighter.franchise,
      DEBUT_SMASH: fighter.debutSmash,
      BRIEF: fighter.brief,
      IMAGE: fighter.image,
    });

    res.send(html);
  } catch (err) {
    console.error("Failed to load fighter:", err.message);
    res.status(500).send("Could not load fighter from the database.");
  }
});

/**
 * ROUTE: 404 catch-all — any URL that doesn't match above routes
 * Example: http://localhost:3000/fighters/fake-name or http://localhost:3000/random
 */
app.use((req, res) => {
  const html = renderTemplate("404.html", {
    MESSAGE: `The page "${req.path}" does not exist.`,
  });
  res.status(404).send(html);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use. Another server is still running.`);
    console.error("Fix: press Ctrl+C in the other terminal, OR run this in PowerShell:\n");
    console.error(
      `  Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
