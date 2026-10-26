# FLUXO — E2E Test Plan

End-to-end suite for FLUXO (a BJJ position map) built with Playwright.

This document records **what was automated, what was not, and why**. Deciding not to automate something is as deliberate as deciding to automate it.

---

## 1. Product model

Understanding the model before writing tests avoids covering functionality that does not exist.

- **Positions** are a fixed catalogue maintained by the product. Users do not create positions.
- Users **build sequences** by chaining catalogue positions together, and save them.
- Users **log training** against a specific position.
- Access is authenticated; part of the content depends on an active subscription.

---

## 2. Selection criteria

Every candidate feature was assessed against five questions:

| # | Criterion | Question |
|---|-----------|----------|
| 1 | Frequency | Is this flow exercised in every regression cycle? |
| 2 | Stability | Is the UI stable, or under active redesign? |
| 3 | Risk | Does a failure here cost money, access, or data? |
| 4 | Determinism | Is the expected outcome objective and assertable? |
| 5 | Layer | Is E2E the cheapest layer that catches this defect? |

A "no" on criteria 4 or 5 rules the candidate out regardless of the rest.

---

## 3. Feature triage

| Feature | Decision | Rationale |
|---------|----------|-----------|
| Authentication (login, invalid credentials, logout) | **Automate** | High risk, high frequency, fully deterministic. It is the gateway to everything else. |
| Protected routes without a session | **Automate** | Security risk, low cost to cover. |
| Browsing the position catalogue | **Automate** | Present in every user session and the foundation for the remaining cases. |
| Building and saving a sequence | **Automate** | Core product value and the main source of regression. |
| Sequence persistence after reload | **Automate** | Exercises the real database integration, which unit tests cannot reach. |
| Logging training on a position | **Automate** | Recurring user action with a verifiable effect in the UI. |
| Language switch PT/EN | **Automate** | Cheap, deterministic, and catches i18n regressions often. |
| Stripe subscription | **Do not automate (E2E)** | Third-party dependency. The suite covers up to the checkout redirect and stops. Beyond that boundary the test validates Stripe, not FLUXO. |
| Training streak and heatmap | **Do not automate (for now)** | Depends on data accumulated across days. Requires clock control or dedicated test data — high cost for the return. A candidate for integration testing with fixed data. |
| Shareable canvas cards | **Do not automate** | Canvas rendering exposes no assertable DOM. Visual judgement belongs to exploratory or visual regression testing. |
| Achievements | **Do not automate (for now)** | Requires building complex accumulated state before every run. The setup costs more than the defect it would prevent. |
| Field format validation | **Do not automate (E2E)** | Wrong layer. This belongs in unit tests. |

---

## 4. Automated cases

### Authentication

**FLX-AUTH-01 — Login with valid credentials**
*Precondition:* dedicated test user, clean session.
1. Open the login page.
2. Fill in a valid email and password, then submit.

*Expected:* redirect to the authenticated area; a visible signal of an active session.
*Priority:* High
*Note:* runs as a setup step, producing the session state reused by the remaining cases.

**FLX-AUTH-02 — Invalid password**
*Precondition:* clean session.
1. Submit a valid email with an incorrect password.

*Expected:* error message visible; user remains on the login page; no session created.
*Priority:* High

**FLX-AUTH-03 — Protected route without a session**
*Precondition:* clean session.
1. Navigate directly to an authenticated-area URL.

*Expected:* redirect to login; protected content never rendered.
*Priority:* High

**FLX-AUTH-04 — Logout ends the session**
*Precondition:* authenticated user.
1. Trigger logout.
2. Attempt to reach a protected route.

*Expected:* return to the unauthenticated state; protected route inaccessible.
*Priority:* Medium
*Note:* logs in fresh inside the test rather than reusing the saved session, so ending the session cannot invalidate the state shared by the authenticated specs.

### Sequences

**FLX-SEQ-01 — Build and save a sequence**
*Precondition:* authenticated user.
1. Select three catalogue positions in order.
2. Trigger the save action and confirm.

*Expected:* save confirmation in the interface; sequence available in the user's list.
*Priority:* High

**FLX-SEQ-02 — Sequence persists after reload**
*Precondition:* a freshly saved sequence.
1. Reload the page.

*Expected:* the sequence is still present, with its positions in the order they were chained.
*Priority:* High
*Note:* this is the case that justifies E2E — it validates the real database integration.

**FLX-SEQ-03 — Delete a sequence**
*Precondition:* an existing sequence.
1. Delete the sequence.
2. Reload the page.

*Expected:* the sequence is absent from the list.
*Priority:* Medium
*Note:* also serves as cleanup, keeping runs independent of one another.

### Catalogue and training

**FLX-CAT-01 — Open a catalogue position**
*Precondition:* authenticated user.
1. Select a position on the map.

*Expected:* position detail displayed, with a name matching the selected item.
*Priority:* Medium

**FLX-DIA-01 — Log training on a position**
*Precondition:* authenticated user, position open.
1. Trigger the training log for the current day.

*Expected:* the entry is reflected in the interface against today's date.
*Priority:* Medium

### Public marketing page

**FLX-HOME-01 — Home page loads**
*Precondition:* no session.
1. Open the home page through the configured base URL.

*Expected:* the page title contains "FLUXO".
*Priority:* Medium

**FLX-HOME-02 — Main calls to action visible**
*Precondition:* no session, default language.
1. Open the home page.

*Expected:* the main heading and the "Começar agora" and "Ver planos" links are visible.
*Priority:* Medium

**FLX-HOME-03 — Pricing reachable from the home page**
*Precondition:* no session.
1. Follow the "Ver planos" link.

*Expected:* the pricing page opens.
*Priority:* Medium

### Internationalisation

**FLX-I18N-01 — Switch between PT and EN**
*Precondition:* any state.
1. Switch the interface language.

*Expected:* reference strings change to the selected language; the selection survives navigation.
*Priority:* Medium

### Subscription (boundary)

**FLX-SUB-01 — Reaching the checkout**
*Precondition:* authenticated user without an active subscription.
1. Start the subscription flow.

*Expected:* redirect to the external checkout.
*Priority:* Medium
*Note:* verification ends at the redirect. Validating the payment itself would be testing Stripe, not FLUXO.

---

## 5. Out of scope

- **Visual and layout testing** — belongs to visual regression, not this functional suite.
- **Performance and load** — different goal, different tooling.
- **Cross-browser coverage** — the suite runs on a single browser. Expanding the matrix without a demonstrated need multiplies execution time and false positives.
- **Exploratory usability testing** — depends on human judgement by definition.

---

## 6. Test independence

Each case is self-sufficient: it creates its own data and depends on neither execution order nor the outcome of another case. Cases that share state fail in cascade, and a suite that fails in cascade stops pointing at where the defect is.

Cases that write data remove what they created afterwards, so repeated runs do not accumulate residue in the environment.

---

## 7. A note on testability

Map nodes are exposed as accessible elements, which makes automation viable without falling back to screen coordinates. That said, the accessible name concatenates a position's title and description, which makes the selector sensitive to copy changes that alter no behaviour.

The structural fix is to add dedicated test attributes to the nodes in the product code. Testability is a design characteristic of the application, not something the test layer can fully compensate for on its own.