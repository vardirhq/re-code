import { describe, expect, it } from 'vitest';
import { analyze } from '../src/analyze.js';
import { buildJourney, findStartingPoints } from '../src/journey.js';
import { readFileSync } from 'node:fs';

describe('evidence-backed exploration', () => {
 it('finds the GitHub import function from a natural-language query', () => {
  const files = Object.fromEntries(['src/main.js','src/analyze.js','src/call-details.js','src/explain-call.js'].map(p => [p, readFileSync(p, 'utf8')]));
  const project = analyze(files);
  expect(findStartingPoints(project, 'How does importing a GitHub repository work?')[0].name).toBe('openGithub');
 });
 it('follows calls in the real import flow and attaches evidence to every connection', () => {
  const files = Object.fromEntries(['src/main.js','src/analyze.js','src/call-details.js','src/explain-call.js'].map(p => [p, readFileSync(p, 'utf8')]));
  const project = analyze(files); const start = project.functions.find(f => f.name === 'openGithub');
  const journey = buildJourney(project, start.id);
  expect(journey.nodes.map(n => n.name)).toContain('load');
  expect(journey.nodes.map(n => n.name)).toContain('analyze');
  expect(journey.edges.every(e => e.path && e.line > 0 && e.expression)).toBe(true);
 });
 it('terminates cycles, preserves unresolved calls, and excludes calls attributed to callbacks from being presented as guaranteed execution', () => {
  const project = analyze({'src/a.js': 'function a() { b(); maybe.run(); }\nfunction b() { a(); }'});
  const journey = buildJourney(project, project.functions.find(f => f.name === 'a').id);
  expect(journey.nodes).toHaveLength(2);
  expect(journey.unresolved.some(x => x.name === 'maybe.run')).toBe(true);
  expect(journey.edges.every(x => x.evidenceKind === 'static-call')).toBe(true);
 });
 it('does not invent a starting point when there is no match', () => {
  const project = analyze({'a.js':'function unrelated() {}'});
  expect(findStartingPoints(project, 'import github')).toEqual([]);
 });
});
it('describes the real GitHub import steps using their source call sites', () => {
 const files = Object.fromEntries(['src/main.js','src/analyze.js','src/call-details.js','src/explain-call.js'].map(p => [p, readFileSync(p, 'utf8')]));
 const project = analyze(files); const start = project.functions.find(f => f.name === 'openGithub');
 const journey = buildJourney(project, start.id);
 const highlights = journey.nodes.flatMap(n => n.highlights);
 expect(highlights.map(x => x.description).join(' ')).toMatch(/repository metadata/i);
 expect(highlights.map(x => x.description).join(' ')).toMatch(/file tree/i);
 expect(highlights.map(x => x.description).join(' ')).toMatch(/raw file/i);
 expect(highlights.every(x => x.path && x.line && x.expression)).toBe(true);
});
it('does not describe a non-GitHub URL as a GitHub API request', () => {
 const project = analyze({'a.js': 'function run() { fetch("https://example.com"); }'});
 const journey = buildJourney(project, project.functions[0].id);
 expect(journey.nodes[0].highlights.map(x=>x.description).join(' ')).not.toMatch(/GitHub/);
});
it('keeps every highlighted expression grounded in its source file', () => {
 const files = Object.fromEntries(['src/main.js','src/analyze.js','src/call-details.js','src/explain-call.js'].map(p => [p, readFileSync(p, 'utf8')]));
 const project = analyze(files); const start = project.functions.find(f => f.name === 'openGithub');
 const highlights = buildJourney(project, start.id).nodes.flatMap(n => n.highlights);
 for (const h of highlights) expect(files[h.path]).toContain(h.expression);
});
