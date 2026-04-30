// Optional handler for /api (no path segments).

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mod = require("../dist/server.js");
const handler = mod?.default ?? mod;

module.exports = async (req, res) => handler(req, res);
