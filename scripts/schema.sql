CREATE TABLE IF NOT EXISTS fighters (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  franchise   VARCHAR(100) NOT NULL,
  debut_smash VARCHAR(100) NOT NULL,
  brief       TEXT NOT NULL,
  image       TEXT NOT NULL
);
