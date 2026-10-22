#!/usr/bin/env node
/**
 * Fails fast when the running Node.js version is below the minimum patch
 * level we require for its major line.
 *
 * Allowed: >=22.23.4 <23  OR  >=24.22.1 (any newer major also passes)
 *
 * This lives in a script (not package.json "engines") on purpose: Vercel
 * resolves an engines range that spans several majors to the newest one, which
 * would silently move 22.x deployments to 24.x. This check keeps each
 * deployment on its current major while still requiring a patched release.
 */

const MINIMUMS = {
  22: [22, 23, 4],
  24: [24, 22, 1],
};

function parse(version) {
  return version
    .replace(/^v/, "")
    .split(".")
    .map((part) => parseInt(part, 10));
}

function compare(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}

function describeAllowed() {
  const majors = Object.keys(MINIMUMS).map(Number);
  const max = Math.max(...majors);
  return majors
    .map((major) => {
      const min = MINIMUMS[major].join(".");
      return major === max ? `>=${min}` : `>=${min} <${major + 1}`;
    })
    .join(" or ");
}

function check(version) {
  const current = parse(version);
  const newestKnownMajor = Math.max(...Object.keys(MINIMUMS).map(Number));
  if (current[0] > newestKnownMajor) {
    return null;
  }
  const minimum = MINIMUMS[current[0]];
  if (!minimum) {
    return `Node.js major ${current[0]} is not supported.`;
  }
  if (compare(current, minimum) < 0) {
    return `Node.js ${version} is below the minimum ${minimum.join(".")} for the ${current[0]}.x line.`;
  }
  return null;
}

if (require.main === module) {
  const version = process.versions.node;
  const error = check(version);
  if (error) {
    console.error(`\n✖ ${error}\n  Allowed: ${describeAllowed()}\n`);
    process.exit(1);
  }
  console.log(`Node.js ${version} satisfies ${describeAllowed()}`);
}

module.exports = { check, describeAllowed };
