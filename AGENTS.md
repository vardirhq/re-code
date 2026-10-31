# AGENTS.md — RE:CODE

## Mission

Build a local-first tool that reconnects software creators with the source code behind their products. Optimize for understanding, curiosity, evidence, and trust, not for generating the most code.

Read `docs/IDEA.md` before planning or implementing changes. Treat it as the product north star, not a fixed technical specification.

## Current stage

**Discovery and planning.** The repository is intentionally not scaffolded yet. Do not build a complete application or choose a stack without an explicit implementation task. Favor small, reviewable steps and reversible decisions.

## Working rules

1. **Read before writing.** Inspect existing files, this document, and any `CLAUDE.md` or nested instructions that apply.
2. **Scope tightly.** Implement only the user-requested milestone. No speculative frameworks, services, configuration layers, or future features.
3. **Be honest about analysis.** Distinguish parser-verified facts, heuristic matches, runtime observations, and LLM inferences. Never present guesses as verified architecture.
4. **Cite source evidence.** Code explanations must eventually resolve to actual file paths and line ranges.
5. **Protect imported source.** Treat repositories as untrusted. No implicit execution, package installation, builds, or network requests. Keep importing read-only by default.
6. **AI is optional.** The core explorer must work without an API key or model. Any upload of source to external providers requires explicit user consent.
7. **Prefer existing mature tooling.** Use language-aware parsing / language servers where appropriate. Do not reinvent parsers as regex-based production infrastructure.
8. **Preserve user agency.** Reveal code rather than replace it with summaries. Avoid auto-writing into imported repositories.
9. **Test claims.** Add focused tests for parsing, relationships, source positions, safety boundaries, and failures. Report what was actually run and what was not.
10. **Keep changes reviewable.** Small commits, precise PR descriptions, no unrelated refactors.
11. **Use clear English.** Write documentation, UI copy, and code comments in American English.

## Suggested workflow for coding agents

- Read `docs/IDEA.md` and repository instructions.
- State the narrow user experience being improved and its success criteria.
- Inspect relevant implementation and tests.
- Make the smallest coherent change.
- Run appropriate checks when feasible.
- Summarize changed behavior, limitations, security considerations, and unrun checks.
- Open a PR rather than committing directly to `main` unless explicitly asked otherwise.

## Non-goals for now

- Game-engine or Sindri integration.
- Hosting, login, subscriptions, analytics, or monetization.
- Fully autonomous coding or agents that silently modify imported projects.
- Treating LLM summaries as a reliable substitute for language analysis.
- Building every future feature before the first exploration flow works.

## Product test

Before adding any feature, ask: **Does this help someone understand or become curious about their own code?** If not, justify why it belongs.
