import { describe, it, expect } from 'vitest';
import { analyze } from '../src/analyze.js';

describe('project analysis', () => {
  it('finds functions and resolves an imported call with source lines', () => {
    const result = analyze({'src/a.ts': "import { helper } from './b';\nexport function start() { return helper(); }", 'src/b.ts': 'export function helper() { return 1; }'});
    const start = result.functions.find(f => f.name === 'start');
    expect(start.line).toBe(2);
    expect(start.calls[0].target).toBe('src/b.ts:1:helper');
  });
  it('does not guess unresolved member calls', () => {
    const result = analyze({'x.ts': 'function run() { obj.save(); }'});
    expect(result.functions[0].calls[0].target).toBeNull();
  });
  it('reports syntax errors and preserves valid files', () => {
    const result = analyze({'bad.ts': 'function broken( {', 'good.ts': 'function fine() {}'});
    expect(result.errors.some(x => x.path === 'bad.ts')).toBe(true);
    expect(result.functions.some(x => x.name === 'fine')).toBe(true);
  });
});

it('explains built-in looking operations and identifies callback nesting', () => {
 const result = analyze({'a.js': 'function analyze(files) { const names = Object.keys(files).filter(p => p.endsWith(".js")); return names; }'});
 const calls = result.functions[0].calls;
 const keys = calls.find(c => c.name === 'Object.keys');
 expect(keys.arguments).toEqual(['files']);
 expect(keys.explanation).toMatch(/property names/i);
 const filter = calls.find(c => c.name.includes('.filter'));
 expect(filter.explanation).toMatch(/filter/i);
 const nested = calls.find(c => c.name === 'p.endsWith');
 expect(nested.context).toMatch(/callback/i);
});
it('does not claim a shadowed Object is the JavaScript built-in', () => {
 const result = analyze({'a.js': 'function run(Object) { Object.keys("x"); }'});
 expect(result.functions[0].calls[0].explanation).not.toMatch(/built.in/i);
 expect(result.functions[0].calls[0].explanation).not.toMatch(/property names/i);
});
it('summarizes parameters, conditional paths, and return expressions with source locations', () => {
 const result = analyze({'a.ts': 'function decide(value: number) {\n if (value > 0) return "yes";\n return "no";\n}'});
 const fn = result.functions[0];
 expect(fn.parameters).toEqual(['value: number']);
 expect(fn.branches).toEqual([{expression:'value > 0',line:2}]);
 expect(fn.returns).toEqual([{expression:'"yes"',line:2},{expression:'"no"',line:3}]);
});
it('does not include a callback return in its enclosing function summary', () => {
 const result = analyze({'a.js': 'function items(xs) { return xs.map(x => { return x + 1; }); }'});
 expect(result.functions[0].returns).toHaveLength(1);
});
