# Locator Strategy

This document explains how I locate elements in this test suite and the reasoning
behind it. The short version: **I locate elements the way a user perceives them,
not the way the HTML is structured.**

## Priority order

I reach for locators in this order, and only drop to the next when the current one
genuinely doesn't fit:

1. **`getByRole(role, { name })`** — the default. Finds an element by its
   accessibility role and accessible name (e.g. a `link` named "Ver planos").
   This is how a screen reader sees the page, so a test written this way verifies
   the experience real users get.
2. **`getByLabel(text)`** — for form fields. A field located by its label is a
   field a user can actually find and fill.
3. **`getByText(text)`** — for non-interactive content (headings, copy) where role
   isn't meaningful.
4. **`getByPlaceholder` / `getByTestId`** — narrow, specific cases only.
5. **CSS / XPath (`page.locator('.class')`)** — last resort. Avoided because it
   couples the test to implementation details.

## Why not CSS selectors?

CSS/XPath locators bind the test to the DOM structure and styling. The moment a
developer renames a class, restructures a wrapper `div`, or a CSS framework
regenerates hashed class names, every test using that selector breaks — even
though the feature still works perfectly for users. Those are false failures, and
false failures are how a test suite loses the team's trust.

Role- and text-based locators break only when the thing a **user** interacts with
actually changes. That's the signal I want a failing test to carry: "the user-facing
behavior changed," not "someone touched the CSS."

## A concrete lesson: "looks like a button" is not "is a button"

While building this suite, a test failed on the home-page call-to-action:

```
Locator: getByRole('button', { name: 'Começar agora' })
Error: element(s) not found
```

The element is clearly styled as a button on screen — but semantically it's a
`<link>`, not a `<button>`. Playwright locates by semantics (the accessibility
tree), not by appearance, so `getByRole('button', ...)` correctly found nothing.
The fix was to locate it by its real role:

```ts
page.getByRole('link', { name: 'Começar agora' })
```

This is a feature, not an inconvenience. It forces the test to reflect the page's
real semantics, and it doubles as a lightweight accessibility check: an element
that *navigates* should be a link, and one that *performs an action* should be a
button. If I ever find an action control implemented as a link, that's a genuine
accessibility bug worth reporting — not something to paper over in the test.

## Base URL

The environment under test is configured once as `baseURL` in
`playwright.config.ts`, so tests navigate with relative paths (`page.goto('/')`).
This keeps the target environment in a single place — swapping to a staging or
local URL is a one-line change instead of an edit across every spec.

## Locator vs. assertion

I keep a clear line between the two:

- The **locator** is plumbing — how I *find* an element. Adjusting a locator
  (link vs. button, a different label) corrects a wrong assumption about where an
  element lives. It does not lower the bar of what's being tested.
- The **assertion** is what I *verify*, and it must encode the requirement. When
  an assertion fails, I stop and ask whether *my expectation* was wrong or *the
  app* is wrong before changing anything — because editing a test to make it pass
  can either fix a bad assumption or hide a real bug.

## Discovering the right locator

When I'm unsure what role or name an element exposes, I use:

- **Pick locator** in Playwright's UI mode — click the element, get the suggested
  locator.
- **`npx playwright codegen <url>`** — click through the page and let Playwright
  write the locators.

Both surface the accessibility tree directly, which is faster and more reliable
than guessing from the visual layout.
