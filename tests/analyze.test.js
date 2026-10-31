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
