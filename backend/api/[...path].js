// Vercel Serverless Function catch-all for /api/*
// This forwards requests to the compiled Express handler.

let cachedHandler;

function getHandler() {
  if (cachedHandler) return cachedHandler;

  // `dist/server.js` is produced by `npm run vercel-build` during Vercel build.
  // It exports a function handler (CommonJS `module.exports`) and/or `default`.
  // We support both shapes.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("../dist/server.js");
  cachedHandler = mod?.default ?? mod;
  return cachedHandler;
}

module.exports = async (req, res) => {
  const handler = getHandler();
  return handler(req, res);
};
