# Taste

- Specifies UI work by dropping design screenshots into a `references/` folder and asking the agent to reproduce the UI exactly in a named component path (e.g. "check image references in @references and create same ui in @...component.tsx"), rather than describing the design in text. Confidence: 0.6
- Communicates in very short, imperative prompts that @-mention file paths and assume the agent will inspect the repo to infer the rest of the context. Confidence: 0.7
- Wants two-month date-range calendars rendered side by side (dual-month row visible at any viewport width) rather than stacking on narrow screens. Confidence: 0.5
- Prefers filters to collapse into a compact summary card after a successful search: tab/inner-tab as a breadcrumb title, remaining filter values joined with `|` in a subtitle, plus an Edit button to reopen the full panel. Confidence: 0.5
- Wants location/scope filters to be hierarchy-aware — surface only the levels below the signed-in user's own region level (driven by `currentUserHierarchy`), not a fixed set of location selects. Confidence: 0.5
