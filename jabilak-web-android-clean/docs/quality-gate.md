# Quality Gate 2026-08-31T18:00:40Z

## TypeScript

> app-template@1.0.0 check /home/ubuntu/tajer-mobile
> tsc --noEmit


## Tests

> app-template@1.0.0 test /home/ubuntu/tajer-mobile
> vitest run

[33mThe CJS build of Vite's Node API is deprecated. See https://vite.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.[39m

 RUN  v2.1.9 /home/ubuntu/tajer-mobile

 ✓ tests/upload-validation.test.ts (8 tests) 6ms
 ✓ tests/data-mappers.test.ts (3 tests) 6ms
 ✓ tests/chat-performance.test.ts (3 tests) 5ms
 ✓ tests/product-search.test.ts (5 tests) 23ms
 ↓ tests/auth.logout.test.ts (1 test | 1 skipped)
 ✓ tests/subscription-plans.test.ts (2 tests) 4ms
 ✓ tests/product-taxonomy.test.ts (4 tests) 6ms
 ✓ tests/input-validation.test.ts (3 tests) 20ms
 ✓ tests/pricing-settings.test.ts (2 tests) 3ms
 ✓ tests/social-following.test.ts (2 tests) 6ms
 ✓ tests/delete-helpers.test.ts (3 tests) 4ms
 ✓ tests/create-ad.test.ts (2 tests) 4ms
 ✓ tests/analytics.test.ts (2 tests) 4ms
 ✓ tests/cart.calculations.test.ts (2 tests) 4ms
 ✓ tests/report-export.test.mjs (1 test) 13ms

 Test Files  14 passed | 1 skipped (15)
      Tests  42 passed | 1 skipped (43)
   Start at  18:00:35
   Duration  1.11s (transform 434ms, setup 0ms, collect 1.06s, tests 109ms, environment 3ms, prepare 1.16s)


## Lint

> app-template@1.0.0 lint /home/ubuntu/tajer-mobile
> expo lint

(node:180190) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of file:///home/ubuntu/tajer-mobile/eslint.config.js?mtime=1787787873042 is not specified and it doesn't parse as CommonJS.
Reparsing as ES module because module syntax was detected. This incurs a performance overhead.
To eliminate this warning, add "type": "module" to /home/ubuntu/tajer-mobile/package.json.
(Use `node --trace-warnings ...` to show where the warning was created)
