# Test cases: auth-logout-home-cleanup

**Basis.** There is no `docs/specs/auth-logout-home-cleanup.md`. These cases were derived from the Analyst's proposal to Herbert (2026-10-26: "automate FLX-AUTH-04 (logout) and clean up the home tests: drop the hard-coded URL and give them `FLX-*` IDs") and from the existing case definitions in `docs/test-plan.md`. The acceptance criteria below are QA's reading of that proposal. The missing spec is recorded as a spec issue in the test report.

| AC | Derived acceptance criterion | Source |
|----|------------------------------|--------|
| AC-1 | After logout the user is back in the unauthenticated state and a protected route redirects to login | test-plan FLX-AUTH-04 |
| AC-2 | The home specs use relative URLs only, so `FLUXO_BASE_URL` controls the target | Analyst proposal |
| AC-3 | Every home test title starts with an FLX ID that exists in `docs/test-plan.md` | Analyst proposal, CLAUDE.md conventions |
| AC-4 | Switching the language changes the reference strings, and the selection survives navigation | test-plan FLX-I18N-01 |

## Traceability

| AC | Test cases |
|----|-----------|
| AC-1 | TC-1, TC-2 |
| AC-2 | TC-3, TC-8 |
| AC-3 | TC-3, TC-4, TC-5, TC-6, TC-7 |
| AC-4 | TC-6, TC-7 |
| Exploratory (FLX-AUTH-02) | TC-9 |

### TC-1: Logout returns the user to the unauthenticated state
- **Acceptance criterion:** AC-1
- **Priority:** high
- **Type:** functional
- **Preconditions:** clean browser context (no stored session); `FLUXO_USER` / `FLUXO_PASS` set
- **Test data:** the dedicated automation account
- **Steps:**
  1. Open `/login` and log in with the automation account.
  2. Wait for the "Sair" button.
  3. Click "Sair".
- **Expected result:** the "Sair" button is gone and the "Entrar" link is visible again ("return to the unauthenticated state", FLX-AUTH-04).
- **Automated by:** `tests/auth.public.spec.ts` › `FLX-AUTH-04 · TC-1 (AC-1): logout returns to the unauthenticated state`
- **Status:** Blocked (no credentials locally)

### TC-2: A protected route is inaccessible after logout
- **Acceptance criterion:** AC-1
- **Priority:** high
- **Type:** security
- **Preconditions:** as TC-1
- **Test data:** the dedicated automation account
- **Steps:**
  1. Log in and wait for the "Sair" button.
  2. Click "Sair" and wait for the "Entrar" link.
  3. Navigate directly to `/app`.
- **Expected result:** the URL ends on `/login` and the "Sair" button is not rendered ("protected route inaccessible", FLX-AUTH-04).
- **Automated by:** `tests/auth.public.spec.ts` › `FLX-AUTH-04 · TC-2 (AC-1): protected route redirects to login after logout`
- **Status:** Blocked (no credentials locally)

### TC-3: Home page loads through the configured base URL
- **Acceptance criterion:** AC-2, AC-3
- **Priority:** medium
- **Type:** functional
- **Preconditions:** no session
- **Test data:** none
- **Steps:**
  1. `page.goto('/')`.
- **Expected result:** the page title contains "FLUXO".
- **Automated by:** `tests/home.public.spec.ts` › `FLX-HOME-01 · TC-3 (AC-2): home page loads from the configured base URL`
- **Status:** Pass

### TC-4: Main calls to action are visible
- **Acceptance criterion:** AC-3
- **Priority:** medium
- **Type:** functional
- **Preconditions:** no session, default language PT
- **Test data:** none
- **Steps:**
  1. Open `/`.
- **Expected result:** heading "O jogo inteiro, num só mapa.", link "Começar agora" and link "Ver planos" are visible.
- **Automated by:** `tests/home.public.spec.ts` › `FLX-HOME-02 · TC-4 (AC-3): main calls to action are visible`
- **Status:** Pass

### TC-5: "Ver planos" leads to the pricing page
- **Acceptance criterion:** AC-3
- **Priority:** medium
- **Type:** functional
- **Preconditions:** no session
- **Test data:** none
- **Steps:**
  1. Open `/`.
  2. Click the "Ver planos" link.
- **Expected result:** the URL contains `/pricing`.
- **Automated by:** `tests/home.public.spec.ts` › `FLX-HOME-03 · TC-5 (AC-3): "Ver planos" leads to the pricing page`
- **Status:** Pass

### TC-6: Switching to EN shows English copy
- **Acceptance criterion:** AC-4, AC-3
- **Priority:** medium
- **Type:** functional
- **Preconditions:** no session, default language PT
- **Test data:** none
- **Steps:**
  1. Open `/`.
  2. Click the "EN" button.
- **Expected result:** heading "Every path of the game, in one map." is visible, the PT heading is not, and "EN" is pressed. (The previous test only checked that the PT text disappeared, which would also pass on a blank page.)
- **Automated by:** `tests/home.public.spec.ts` › `FLX-I18N-01 · TC-6 (AC-4): switching to EN shows English copy`
- **Status:** Pass

### TC-7: The language choice survives navigation
- **Acceptance criterion:** AC-4, AC-3
- **Priority:** medium
- **Type:** functional
- **Preconditions:** no session, default language PT
- **Test data:** none
- **Steps:**
  1. Open `/` and click "EN".
  2. Click the "Pricing" nav link.
  3. Navigate directly to `/login`.
- **Expected result:** on `/pricing` the "EN" button is pressed and the "Pricing" nav link is shown; on `/login` the heading is "Log in".
- **Automated by:** `tests/home.public.spec.ts` › `FLX-I18N-01 · TC-7 (AC-4): language choice survives navigation`
- **Status:** Pass

### TC-8: No hard-coded environment URL in specs
- **Acceptance criterion:** AC-2
- **Priority:** low
- **Type:** functional
- **Preconditions:** none
- **Test data:** none
- **Steps:**
  1. `grep -rn "railway.app" tests pages`.
- **Expected result:** no matches.
- **Automated by:** manual check (static property of the code, not app behaviour)
- **Status:** Pass

### TC-9: Invalid password shows the visible error message
- **Acceptance criterion:** exploratory (FLX-AUTH-02)
- **Priority:** high
- **Type:** negative
- **Preconditions:** clean session; `FLUXO_USER` set
- **Test data:** `FLUXO_USER`, password `senha-errada-123`
- **Steps:**
  1. Open `/login`, submit the email with the wrong password.
- **Expected result:** the text "E-mail ou senha inválidos." is visible and the URL stays on `/login`.
- **Background:** FLX-AUTH-02 asserted `getByRole('alert')`. The only `role="alert"` element on the page is Next.js's empty `#__next-route-announcer__`, which Playwright reports as visible, so the assertion passed whether or not an error was shown. The real error text has no alert role. `LoginPage.errorMessage` now targets the error text.
- **Automated by:** `tests/auth.public.spec.ts` › `FLX-AUTH-02: senha inválida exibe erro e não cria sessão`
- **Status:** Blocked (no credentials locally; the locator was verified manually against a non-existent account)

## Not covered

- **Back button after logout** (does browser history re-render cached app content?): it depends on bfcache behaviour, and the tests can't be run locally without credentials, so a timing-sensitive case would go in unverified. It's a candidate for a later round.
- **Logout reusing the shared `storageState` session:** deliberately avoided. Logging out may revoke the server-side session that every `*.auth.spec.ts` test shares, which would break them depending on execution order. TC-1/TC-2 log in fresh instead.
- **Refactoring `auth.setup.ts` to use `LoginPage`** and translating its leftover PT TODOs: listed in CLAUDE.md as a known gap but outside this proposal's scope.
