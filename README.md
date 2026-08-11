# FLUXO — E2E Test Suite

<!-- Paste your badge here: Actions → Playwright Tests → ... → Create status badge -->

End-to-end test suite for [FLUXO](https://fluxo-production-052e.up.railway.app), a web application that maps Brazilian Jiu-Jitsu positions and lets practitioners chain them into sequences and log training.

Built with [Playwright](https://playwright.dev) and TypeScript. The suite runs on every push through GitHub Actions.

This repository is as much about **test design decisions** as it is about the tests themselves. The reasoning behind what is covered — and what deliberately is not — lives in [`docs/test-plan.md`](docs/test-plan.md).

---

## Coverage at a glance

| Area | Cases | Status |
|------|-------|--------|
| Authentication | 3 | Passing |
| Public marketing page | 3 | Passing |
| Internationalisation (PT/EN) | 1 | Passing |
| Sequence building | 2 | Skipped — see [Known limitations](#known-limitations) |

---

## Running locally

```bash
npm ci
npx playwright install --with-deps chromium

cp .env.example .env   # then fill in the values
npx playwright test
```

Useful during development:

```bash
npx playwright test --ui        # watch mode with time-travel debugging
npx playwright show-report      # open the last HTML report
```

### Environment variables

| Variable | Purpose |
|----------|---------|
| `FLUXO_BASE_URL` | Base URL of the environment under test |
| `FLUXO_USER` | Email of the dedicated automation account |
| `FLUXO_PASS` | Password of that account |

The suite uses a dedicated test account, never a real user account: it writes data, and its credentials live in a CI secret store.

---

## Structure

```
pages/          Page objects — where elements are
tests/          Specs — what should happen
docs/           Test plan and locator strategy
.github/        CI workflow
```

Page objects expose locators and actions; they contain no assertions. Assertions live in the specs, so a page object never decides what "correct" means.

---

## Design decisions

**Authentication runs once.** A setup project logs in and saves the session state to disk; authenticated specs reuse it. Logging in before every test would add minutes to the run and turn an unrelated login change into a suite-wide failure.

**Public and authenticated specs are separate projects.** Files ending in `.public.spec.ts` run with no session; `.auth.spec.ts` files run with the saved state. This matters because the marketing page renders differently for signed-in users — running public assertions inside a session would produce failures that point at the wrong cause.

**Locators favour accessible roles and names** over CSS paths or positional indexes. A selector tied to layout structure breaks on the first redesign and reports a defect that does not exist. The full reasoning is in [`docs/locators.md`](docs/locators.md).

**No arbitrary waits.** The suite waits for meaningful conditions — an element becoming visible, a URL changing — rather than fixed timeouts. Fixed waits either slow every run down or hide a real race condition until it surfaces in CI.

**`forbidOnly` is enabled in CI.** A stray `test.only` reaching the main branch silently disables the rest of the suite. Failing the build is cheaper than a green pipeline that tests one thing.

---

## Known limitations

These are recorded rather than hidden. A suite that only documents its successes is not much of a quality artifact.

**CI runs against the deployed environment.** The correct approach is for the pipeline to stand up an ephemeral instance with its own database, so tests never depend on a shared environment and never write to one real users touch. Running against the deployed app introduces two problems: cold starts on the hosting platform can cause navigation timeouts unrelated to the application, and test data accumulates in a live database. This is a deliberate trade-off for a portfolio project rather than a recommendation.

**Two sequence cases are skipped.** Map nodes expose an accessible name that concatenates a position's title and description, which makes any selector sensitive to copy changes that alter no behaviour. The structural fix is dedicated test attributes on the node components in the application itself. Testability is a design characteristic of a product, not something the test layer can fully compensate for — the skipped cases are kept in place, with their reason documented, so they can be enabled once that support exists.

**Single browser.** The suite runs on Chromium only. Expanding the matrix without a demonstrated compatibility requirement multiplies execution time and false positives for no additional signal.

---

## Reports

Every CI run uploads the Playwright HTML report as an artifact, including traces for failed tests. The trace viewer shows the exact state of the page at the moment of failure, which is usually faster than reproducing the failure locally.
