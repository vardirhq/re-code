# RE:CODE

Understand what you build. RE:CODE is a read-only browser-based explorer for JavaScript and TypeScript projects. Open a local folder or enter a public GitHub repository URL, search for a function, inspect its source, and follow calls whose definitions can be resolved.

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

Run `npm test` for the analysis tests and `npm run build` for a static build. The GitHub Pages workflow deploys `main` when Pages is configured to use GitHub Actions.

## Privacy and limitations

Local files are read and analyzed in the browser; they are not executed or uploaded. GitHub imports fetch public source directly from GitHub. No GitHub authentication or private repositories are supported yet. GitHub imports are capped at the first 100 supported files, and files larger than 1 MB are skipped. GitHub API rate limits may apply. Folder selection availability depends on the browser. Files with syntax errors are reported and omitted from analysis.

The explorer lists calls present in source, not a guaranteed runtime sequence. Resolution is limited to what TypeScript can establish from the imported source; dynamic calls, missing dependencies, aliases, and incomplete projects may remain unresolved. Text matches are clues, not verified connections to handlers. No AI is used.

## Follow a behavior

Search for a function name or words from a question, such as “How does importing a GitHub repository work?” Search suggestions are text-based clues, not an understanding of the question. Choose a starting function to see a bounded map of calls and source-backed highlights. Select an evidence item to inspect its source line, or open a connected function to continue exploring.

The map shows calls found in source, not a runtime trace or a guaranteed sequence. Callback and conditional calls may not execute. It follows at most two levels and twelve functions, so it can omit relevant code; unresolved calls and truncation are reported. The GitHub URL descriptions recognize specific URL patterns and do not establish what a called helper does at runtime. Search clues outside indexed functions cannot currently be opened in the function viewer.

## Beginner view

After opening a project, start with a question or choose a suggested part. Search is based on words in the source and does not understand the question. Some recognizable GitHub-import patterns have short, source-linked explanations; other results explicitly say that an explanation is not yet available. The technical explorer remains available under “Look at the code and connections.” No AI or external model is used.
