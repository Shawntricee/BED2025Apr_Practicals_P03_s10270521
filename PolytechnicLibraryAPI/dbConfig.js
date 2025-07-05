module.exports = {
  user: process.env.DB_USER || "libraryadmin",
  password: process.env.DB_PASSWORD || "LibraryPass123!",
  server: process.env.DB_SERVER || "LAPTOP-L6SVGOVS\\SQLEXPRESS",
  database: process.env.DB_DATABASE || "PolytechnicLibrary",
  trustServerCertificate: true,
  options: {
    port: parseInt(process.env.DB_PORT) || 1433,
    connectionTimeout: 60000,
    requestTimeout: 60000,
    encrypt: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};