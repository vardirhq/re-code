import { expect, it } from 'vitest';
import { callDetails } from '../src/call-details.js';

it('shows the call site and explains unresolved targets without guessing', () => {
 const result = callDetails({name:'Object.keys',line:2,target:null}, 'const a = 1;\nObject.keys(a);');
 expect(result.source).toBe('Object.keys(a);');
 expect(result.message).toMatch(/could not determine/i);
});
it('offers navigation when a definition is known', () => {
 const result = callDetails({name:'helper',line:1,target:'a.ts:1:helper'}, 'helper();');
 expect(result.message).toMatch(/definition/i);
 expect(result.target).toBe('a.ts:1:helper');
});
