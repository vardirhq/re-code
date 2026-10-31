import { it, expect } from 'vitest';
import { analyze } from '../src/analyze.js';
import { createBeginnerSummary, readableName } from '../src/beginner.js';
import { readFileSync } from 'node:fs';
it('gives a plain-language, source-linked overview of the real GitHub import path', () => {
 const paths=['src/main.js','src/analyze.js','src/call-details.js','src/explain-call.js','src/journey.js'];
 const files=Object.fromEntries(paths.map(p=>[p,readFileSync(p,'utf8')]));
 const project=analyze(files); const fn=project.functions.find(f=>f.name==='openGithub');
 const result=createBeginnerSummary(project,fn.id);
 expect(result.explained).toBe(true);
 expect(result.steps.map(s=>s.text).join(' ')).toMatch(/GitHub/);
 expect(result.steps.map(s=>s.text).join(' ')).toMatch(/files/i);
 for(const s of result.steps){expect(files[s.path]).toContain(s.expression);expect(s.line).toBeGreaterThan(0)}
});
it('does not invent a purpose when it cannot explain a function', () => {
 const project=analyze({'x.js':'function mystery(x) { return x; }'});
 expect(createBeginnerSummary(project,project.functions[0].id).explained).toBe(false);
});
it('formats names as clues rather than claiming intent',()=>expect(readableName('openGithub')).toBe('Open Github'));
