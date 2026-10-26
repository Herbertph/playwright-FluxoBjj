# Test report: auth-logout-home-cleanup

- **Mode:** full test run
- **Branch:** `test/auth-logout-home-cleanup` (based on `main` @ `a43f36f`)
- **Date:** 2026-10-26
- **Environment:** production (`https://fluxo-production-052e.up.railway.app`), Chromium, Windows 11, no `.env` (no credentials)
- **Verdict:** **FAIL (blocked, not defective).** AC-1 (logout) has no passing run yet: its tests need `FLUXO_USER` / `FLUXO_PASS`, which are not available on this machine. No product or suite defect is open.

## Counts

| | Count |
|---|---|
| Test cases | 9 |
| Pass | 6 (TC-3 to TC-8) |
| Fail | 0 |
| Blocked (credentials) | 3 (TC-1, TC-2, TC-9) |
| Issues opened | 0 |
| Flaky | 0 (public specs run 3× each: 18/18 passed) |

Full suite run with `FLUXO_BASE_URL` set: 6 passed, 4 failed, 2 did not run. All 4 failures are `locator.fill: value: expected string, got undefined` (missing credentials: `auth.setup.ts`, FLX-AUTH-02, FLX-AUTH-04 ×2). The 2 that did not run are the already-skipped FLX-SEQ-01/02. `--list`: 12 tests in 4 files.

## Traceability

| AC | Test case | Result |
|----|-----------|--------|
| AC-1 logout ends the session | TC-1, TC-2 | Blocked (no credentials) |
| AC-2 relative URLs only | TC-3, TC-8 | Pass |
| AC-3 FLX IDs on home tests | TC-3, TC-4, TC-5, TC-6, TC-7 | Pass |
| AC-4 language switch + persistence | TC-6, TC-7 | Pass |
| Exploratory: FLX-AUTH-02 | TC-9 | Blocked (no credentials) |

## What changed

- `tests/auth.public.spec.ts`: FLX-AUTH-04 added as two tests. Each one logs in fresh and does not reuse the saved `storageState`, so a logout cannot revoke the session the `auth` project shares.
- `pages/AppHeader.ts` (new): logout button and the "Entrar" link.
- `tests/home.public.spec.ts`: removed the hard-coded production URL. Tests are now FLX-HOME-01..03 and FLX-I18N-01. FLX-I18N-01 now checks that English copy actually appears (it used to check only that the PT text disappeared) and covers the "survives navigation" part of the plan.
- `pages/LoginPage.ts`: fixed the FLX-AUTH-02 false positive (see below).
- `docs/test-plan.md`: added FLX-HOME-01..03 and a note on FLX-AUTH-04. `README.md`: updated the coverage table.

## Findings

1. **FLX-AUTH-02 was a false positive (suite defect, fixed in this branch).** `LoginPage.errorMessage` was `getByRole('alert')`. On `/login` the only `role="alert"` element is Next.js's empty `#__next-route-announcer__`. Playwright reports it as visible, so the test passed whether or not an error appeared. The locator now targets the visible text "E-mail ou senha inválidos.". I verified this text manually with a non-existent account (`POST /api/auth/login` → 401).
2. **FLUXO accessibility observation (product, outside this repo):** the login error "E-mail ou senha inválidos." is plain text with no `role="alert"` or live region, so screen readers do not announce it. This should be raised against the FLUXO app repository. It was not filed here.

## Spec issues

- There is no `docs/specs/auth-logout-home-cleanup.md`. Work started from the Analyst's proposal at Herbert's request. The ACs in `docs/test-cases/auth-logout-home-cleanup.md` are QA's interpretation and need the Analyst's confirmation.
- CLAUDE.md lists the case-ID areas as AUTH, SEQ, CAT, DIA, I18N, SUB. This change adds **HOME**, so CLAUDE.md needs an update (the Analyst owns that file).

## Code review notes (non-blocking)

- `errorMessage` is now tied to the PT copy. That is consistent with the suite's existing PT locators, but a copy change will break it. The structural fix is a `role="alert"` on the error in FLUXO (finding 2), after which the locator can go back to `getByRole('alert', { name: ... })`.
- `auth.setup.ts` still duplicates the login steps and has PT TODOs (known gap, out of scope).

## To unblock

Run with credentials: `npx playwright test --project=public auth.public`, or let CI run on a PR from this branch. If TC-1, TC-2 and TC-9 pass, update their status in the test-cases file and change the verdict to PASS.
