# CLAUDE.md

## What this is

An **end-to-end test suite** (not an application) for [FLUXO](https://fluxo-production-052e.up.railway.app), a web app that maps Brazilian Jiu-Jitsu positions, lets practitioners chain them into sequences, and log training. The FLUXO app code lives elsewhere; this repo only drives it through a browser.

The repo is also a portfolio piece about **test design decisions**. `README.md` and `docs/test-plan.md` explain what is automated, what deliberately is not, and why. Keep them truthful when coverage changes.

## Stack

- Playwright Test `^1.62` + TypeScript (transpiled by Playwright; there is no `typescript` dependency and no `tsc` step)
- `dotenv` loads `.env` in `playwright.config.ts`
- Node 20 in CI (GitHub Actions, `ubuntu-latest`), Chromium only

## Commands

There are no npm scripts; use `npx` directly.

```bash
npm ci
npx playwright install --with-deps chromium   # locally on Windows: npx playwright install chromium
cp .env.example .env                           # fill FLUXO_USER / FLUXO_PASS

npx playwright test                    # full suite (needs credentials)
npx playwright test --project=public   # no-session specs only
npx playwright test --list             # list tests without running
npx playwright test --ui               # interactive debugging
npx playwright show-report             # last HTML report
```

Verified during onboarding (2026-10-26): `npm ci`, `--list` (9 tests in 4 files) and `npx playwright test --project=public home.public` (4 passed) against the deployed app. Specs that log in need `FLUXO_USER` / `FLUXO_PASS`; without them `auth.setup.ts` and `FLX-AUTH-02` fail.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `FLUXO_BASE_URL` | Environment under test (default in `.env.example`: the Railway production URL) |
| `FLUXO_USER` | Email of the dedicated automation account |
| `FLUXO_PASS` | Its password |

In CI these come from repository secrets. **Never commit `.env` or real credentials**, and never print them in logs, issues or PRs. `playwright/.auth/` (saved session) is gitignored and must stay that way: it contains a live session token.

## Structure

```
playwright.config.ts   3 projects: setup, public, auth (see below)
pages/                 Page objects: locators + actions, NO assertions
  LoginPage.ts         login form
  MindMapPage.ts       position map, sequence save, "Treinei hoje"
tests/
  auth.setup.ts        logs in once, saves playwright/.auth/user.json
  auth.public.spec.ts  FLX-AUTH-02, FLX-AUTH-03
  home.public.spec.ts  marketing page + PT/EN switch
  sequence.auth.spec.ts FLX-SEQ-01/02 (both test.skip, see Known gaps)
docs/
  test-plan.md         product model, triage, case catalogue (FLX-* IDs)
  locators.md          locator priority and reasoning
  specs/ test-cases/ test-reports/   team artifacts (one file per feature slug)
.github/workflows/playwright.yml   CI: runs on push/PR to main, uploads HTML report
```

All files are small (under 200 lines); `docs/test-plan.md` is the largest and the source of truth for case IDs.

## Conventions

- **Project routing by file name** (configured in `playwright.config.ts`):
  - `*.setup.ts` → `setup` project
  - `*.public.spec.ts` → `public` project, no session (the marketing page renders differently when signed in)
  - `*.auth.spec.ts` → `auth` project, reuses the saved session, depends on `setup`
  A new spec that does not match one of these patterns **will not run**.
- **Locators**: `getByRole` with name first, then `getByLabel`, `getByText`, `getByTestId`; CSS/XPath last resort. See `docs/locators.md`.
- **No fixed waits** (`waitForTimeout`). Wait on visible elements or URL changes.
- **Page objects hold no assertions**; assertions live in specs.
- **Case IDs**: `FLX-<AREA>-<NN>` (AUTH, SEQ, CAT, DIA, I18N, SUB) matching `docs/test-plan.md`. Put the ID at the start of the test title.
- **Test independence**: every case creates its own data and cleans up what it writes. The suite runs against the *deployed production app* with a dedicated account, so anything a test writes lands in a real database.
- Use relative URLs (`page.goto('/')`) so `FLUXO_BASE_URL` controls the target.
- The FLUXO UI is in Portuguese by default; locators use PT copy (`Entrar`, `Senha`, `Ver planos`). Some existing titles and identifiers are PT, some EN; new code, titles and comments should be in English.
- `forbidOnly` is on in CI: never commit `test.only`.
- CI retries once and records traces on first retry.

## Known gaps (from the current code)

- FLX-SEQ-01/02 are skipped: map nodes have no stable test attributes and their accessible name mixes title and description. Enabling them needs a change in the FLUXO app itself.
- Cases in `docs/test-plan.md` not automated yet: FLX-AUTH-04 (logout), FLX-SEQ-03 (delete), FLX-CAT-01, FLX-DIA-01, FLX-SUB-01, and the "survives navigation" part of FLX-I18N-01.
- `home.public.spec.ts` first test hard-codes the production URL instead of `/`, and its tests have no FLX IDs.
- `auth.setup.ts` duplicates the login steps instead of using `LoginPage`; some comments are leftover PT TODOs.

## Definition of done

1. New or changed cases follow the conventions above and have an FLX ID that exists in `docs/test-plan.md` (add it there if new).
2. `npx playwright test` passes locally with credentials, or the failure is a real FLUXO defect filed as a GitHub issue.
3. Any skipped test has a comment explaining why and what would unblock it.
4. `README.md` coverage table and `docs/test-plan.md` reflect the change.
5. No secrets, `.env`, `playwright/.auth/` or report folders committed.
6. CI (`Playwright Tests` workflow) is green on the PR.
