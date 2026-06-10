// Creates the missing noop-head.js stub that next-flight-loader requires.
// This file is absent from some Next.js 14.2.x pnpm installations.
const fs = require('fs');
const path = require('path');

try {
  const nextDir = path.dirname(require.resolve('next/package.json'));
  const target = path.join(nextDir, 'dist', 'client', 'components', 'noop-head.js');
  if (!fs.existsSync(target)) {
    fs.writeFileSync(
      target,
      '"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nexports.default = function NoopHead() { return null; };\n'
    );
    console.log('[fix-noop-head] created stub at', target);
  }
} catch (e) {
  console.warn('[fix-noop-head] skipped:', e.message);
}
