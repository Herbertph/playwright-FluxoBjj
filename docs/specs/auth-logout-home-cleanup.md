# Spec: auth-logout-home-cleanup

> Written after QA started the work (Herbert approved the Analyst's proposal on 2026-10-26). It confirms the acceptance criteria QA derived in `docs/test-cases/auth-logout-home-cleanup.md`.

## Context
The test plan defines FLX-AUTH-04 (logout) but it was not automated, and the home specs hard-coded the production URL and had no case IDs. This change closes both gaps without writing any data to the production database.

## Scope
**In scope:** automate FLX-AUTH-04; make the home specs use relative URLs and FLX IDs; complete FLX-I18N-01 ("survives navigation"); fix suite defects found along the way.
**Out of scope:** the skipped FLX-SEQ cases, `auth.setup.ts` refactor, any change to the FLUXO app.

## Functional requirements
- FR-1: The suite verifies that logout ends the session.
- FR-2: Home specs navigate with relative URLs only.
- FR-3: Every home test title starts with an FLX ID that exists in `docs/test-plan.md` (new area: `HOME`).
- FR-4: FLX-I18N-01 checks that English copy appears and that the choice survives navigation.

## Acceptance criteria
- **AC-1** Given a logged-in user, when they log out, then the unauthenticated header is shown, and when they then open a protected route, they are redirected to `/login`. The logout tests must not use the shared `storageState`.
- **AC-2** Given `FLUXO_BASE_URL` points at an environment, when the home specs run, then no spec contains an absolute FLUXO URL.
- **AC-3** Given the home specs, when listed, then each title starts with an FLX ID defined in `docs/test-plan.md`.
- **AC-4** Given the home page in PT, when the user switches to EN, then English reference copy is visible and PT copy is hidden; when they navigate to another page, then EN stays selected.
- **AC-5** Given an invalid password, when the user submits the login form, then FLX-AUTH-02 passes only if the visible error message appears (no false positive from unrelated `role="alert"` elements).

## Assumptions to confirm
- The new `HOME` ID area is acceptable for marketing-page cases.
- The FLX-AUTH-02 error locator uses the PT text "E-mail ou senha inválidos." until FLUXO adds `role="alert"` to the error (an accessibility finding for the FLUXO app repository).

## Technical notes
Logout tests live in `tests/auth.public.spec.ts` with a fresh login per test; header locators go in `pages/AppHeader.ts`.
