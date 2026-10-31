# RE:CODE — Product Idea

**Working tagline:** Understand what you build.

## The problem

AI coding agents make it possible to produce sophisticated software without spending much time reading or touching its implementation. That's empowering, but it can also disconnect a creator from the software they made. Today's tools are good at either showing raw code or generating more code. Fewer experiences are designed around curiosity, comprehension, and gradual ownership.

## The proposition

RE:CODE is a local-first, interactive code exploration environment that connects the *behavior of a product* to the *source code that makes it work*. It should make a creator curious enough to open code, not guilt them into manually writing everything.

**Promise:** Start from what a program does, reveal how it works, and navigate all the way down to verifiable source lines.

## Who it's for

- People who build applications using AI agents but want to understand and maintain them.
- Developers increasingly delegating implementation and losing familiarity with their own codebases.
- Curious learners who prefer investigating real projects to toy exercises.

## Core experience

1. **Open a repository.** Import a local repository without requiring an account, API key, or remote upload.
2. **Discover what is there.** Browse files, symbols, dependencies, and eventually logical product features.
3. **Explore one thing.** Pick a function, feature, or execution path; see a plain-language overview and a visual flow where reliable data supports it.
4. **Reveal the evidence.** Follow every claim to exact file paths, source ranges, and relationships.
5. **Interact and learn.** Inspect inputs and outputs, answer grounded questions, and eventually experiment safely with isolated code.
6. **Understand changes.** Later, explore Git diffs and AI-generated PRs as behavior changes rather than only lines changed.

## Design principles

- **Code remains visible.** This is not a chatbot hiding the repository behind fluent summaries.
- **Progressive disclosure.** Begin with purpose and behavior; reveal structure, execution, and source on demand.
- **Facts versus inference.** Show which relationships static analysis establishes and which descriptions are AI interpretations. Confidence is not verification.
- **Evidence-backed explanations.** Interpretations must cite concrete code locations and acknowledge uncertain or incomplete analysis.
- **No AI dependency for baseline features.** Parsing, navigation, symbol discovery, and Git browsing should work locally. AI is optional and explicitly enabled.
- **Read-only by default.** Never execute untrusted repository code, run install scripts, or modify source merely by importing it.
- **Small, useful milestones.** Prove one excellent interaction before building a platform.
- **Platform independence.** This project must have no dependency on Sindri or its games.

## Suggested product layout (not a committed design)

- Left: repository and feature/symbol navigation.
- Center: selected behavior, visual relationships, source viewer.
- Right or contextual drawer: explanations, evidence, and guided exploration.
- Always provide a path back to the original file and line.

## Technical direction (provisional)

- Local-first desktop or locally hosted web UI; choose based on an implementation spike.
- Start with TypeScript/JavaScript as the first language, then expand based on demand.
- Use mature parsers or language tooling (Tree-sitter / LSP as appropriate), not regex as the long-term source of truth.
- Build a deterministic index of files, symbols, references, and source ranges.
- Add optional pluggable model providers later, including local models where practical.
- Keep derived analysis cacheable and invalidatable as repositories change.
- Treat repository files and AI output as untrusted input; do not leak source code to a provider without explicit opt-in.

## First MVP: One repository, one function, one understanding

**In scope**
- Select a local JS/TS repository.
- Find and search function declarations with a real parser.
- Show accurate source ranges and direct navigation to related files/symbols.
- Show a concise, deterministic structural summary (name, parameters, return annotation, directly known references).
- One genuinely useful walkthrough of a selected function based on provable information.
- Clear empty, unsupported, and parse-error states.

**Out of scope**
- AI chat, model subscriptions, autonomous code writing, whole-repo semantic maps, hosted synchronization, accounts, billing, executing arbitrary project code, automatic learning questions.

### MVP acceptance criteria

- A first-time user can import a small supported repository and inspect a function without configuring AI.
- Each structural claim is traceable to a file and source range.
- Missing or ambiguous relationships are labeled as such rather than hallucinated.
- Indexing never executes imported code.
- The interaction is usable on a laptop-sized screen and works without an internet connection after setup.
- Automated tests cover parser edge cases, source ranges, path handling, and error states.

## Possible later milestones

1. **Feature maps:** inferred product-level concepts backed by static dependency links and cited code.
2. **Optional AI mentor:** explanations, questions, and hints grounded in repository evidence.
3. **PR comprehension:** before/after behavior summaries for agent-authored changes, linked to diffs.
4. **Safe experiments:** instrumented or sandboxed pure-function playgrounds with explicit trust boundaries.
5. **Comprehension journeys:** optional history of what the user explored and can explain.

## Open questions

- Desktop shell, local service, or pure web UI?
- What is the smallest useful visual representation of a function's relationships?
- How do we evaluate whether explanations improve understanding rather than merely sounding helpful?
- What repository size and language features should the first milestone support?

## Definition of success

A user opens RE:CODE **because exploring the code is enjoyable**, not because they have to debug something. If the experience is just a prettier file tree or another AI chat window, we missed the point.
