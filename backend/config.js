'use strict';

function loadConfig(env = process.env) {
  // Keep database access local; do not reuse the historical cloud credentials.
  if (env.DB_HOST !== '127.0.0.1' || env.DB_NAME !== 'vocabuddy_local') {
    throw new Error('Use DB_HOST=127.0.0.1 and DB_NAME=vocabuddy_local for local development');
  }
  for (const key of ['DB_USER', 'DB_PASSWORD']) {
    if (!env[key]) throw new Error(`Missing ${key}`);
  }
  function port(name, fallback) {
    const value = Number(env[name] || fallback);
    if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error(`Invalid ${name}`);
    return value;
  }
  return {
    host: '127.0.0.1', port: port('PORT', 3001),
    database: { host: env.DB_HOST, port: port('DB_PORT', 3307),
      database: env.DB_NAME, user: env.DB_USER, password: env.DB_PASSWORD,
      multipleStatements: false }
  };
}
module.exports = { loadConfig };
