const { Pool } = require('pg');

const pool = new Pool({
  host: 'dpg-d1uundc9c44c73dbv7fg-a.oregon-postgres.render.com',
  port: 5432,
  database: 'mathlink_db',
  user: 'jigg',
  password: 'zcfzyPZeWcNIl0TFqtSrWiUo5X3BGdFq',
  max: 10,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
