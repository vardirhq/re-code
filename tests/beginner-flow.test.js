// @vitest-environment happy-dom
import { expect, it } from 'vitest';
it('starts with a question and keeps technical details closed', async () => {
 document.body.innerHTML = '<div id="app"></div>';
 await import('../src/main.js');
 document.querySelector('#sample').click();
 expect(document.body.textContent).toContain('What would you like to understand?');
 expect(document.querySelector('.technical-details')).toBeNull();
 const search = document.querySelector('#beginner-search');
 search.value = 'import'; search.dispatchEvent(new Event('input', {bubbles:true}));
 const suggestion = document.querySelector('.beginner-results [data-id]');
 expect(suggestion).not.toBeNull(); suggestion.click();
 expect(document.querySelector('.beginner-answer')).not.toBeNull();
 expect(document.querySelector('.technical-details').open).toBe(false);
 expect(document.querySelector('.beginner-answer').textContent).toContain('can’t yet explain');
 document.querySelector('#questions-back').click();
 expect(document.querySelector('#beginner-search')).not.toBeNull();
});
it('opens the real GitHub import explanation from a question', async () => {
 const { vi } = await import('vitest');
 const { readFileSync } = await import('node:fs');
 vi.resetModules();
 const paths=['src/main.js','src/analyze.js','src/call-details.js','src/explain-call.js','src/journey.js','src/beginner.js'];
 vi.stubGlobal('fetch', vi.fn(async url => {
  const link=String(url);
  if(link.includes('/git/trees/')) return {ok:true,json:async()=>({tree:paths.map(path=>({type:'blob',path,size:1000})),truncated:false})};
  if(link.startsWith('https://api.github.com/')) return {ok:true,json:async()=>({default_branch:'main'})};
  const path=paths.find(p=>link.endsWith('/'+p));
  return {ok:!!path,text:async()=>readFileSync(path,'utf8')};
 }));
 document.body.innerHTML='<div id="app"></div>';
 await import('../src/main.js');
 document.querySelector('#repo').value='https://github.com/vardirhq/re-code';
 document.querySelector('#open-repo').click();
 await vi.waitFor(()=>expect(document.querySelector('#suggest-github')).not.toBeNull());
 document.querySelector('#suggest-github').click();
 expect(document.querySelector('.beginner-answer').textContent).toContain('information about the project');
 expect(document.querySelector('.beginner-answer').textContent).toContain('list of files');
 expect(document.querySelector('.simple-evidence summary').textContent).toBe('Show me where');
 const evidence=document.querySelector('.simple-evidence'); evidence.querySelector('summary').click();
 expect(evidence.open).toBe(true); expect(evidence.querySelector('code').textContent).toContain('github');
 expect(document.querySelector('.technical-details').open).toBe(false);
 vi.unstubAllGlobals();
});
