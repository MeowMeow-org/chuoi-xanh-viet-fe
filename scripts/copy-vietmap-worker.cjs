/**
 * Đồng bộ vietmap-gl-csp-worker.js vào public/ (same-origin, tránh blob worker + Failed to fetch).
 */
const fs = require("fs");
const path = require("path");

const src = path.join(
  __dirname,
  "../node_modules/@vietmap/vietmap-gl-js/dist/vietmap-gl-csp-worker.js",
);
const dest = path.join(__dirname, "../public/vietmap-gl-csp-worker.js");

if (fs.existsSync(src)) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}
