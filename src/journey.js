const STOP = new Set(['how','does','do','the','a','an','what','work','works','is','of','from','to','and','repository','repo','project','when','user','someone']);
function words(query) {
  return [...new Set(query.toLowerCase().match(/[a-z0-9]+/g) || [])].filter(x => !STOP.has(x)).map(x => x.replace(/(?:ing|ed|s)$/, ''));
}
export function findStartingPoints(project, query) {
  const terms = words(query);
  if (!terms.length) return [];
  return project.functions.map(fn => {
    const name = fn.name.toLowerCase(), path = fn.path.toLowerCase();
    const body = project.files[fn.path].split('\n').slice(fn.line - 1, fn.endLine).join('\n').toLowerCase();
    const score = terms.reduce((n, term) => n + (name.includes(term) ? 12 : path.includes(term) ? 4 : body.includes(term) ? 1 : 0), 0);
    return { fn, score };
  }).filter(x => x.score > 0).sort((a,b) => b.score - a.score || a.fn.name.localeCompare(b.fn.name)).slice(0, 20).map(x => x.fn);
}
function highlightsFor(fn) {
  const highlights = [];
  for (const call of fn.calls) {
    const first = call.arguments?.[0] || '';
    let description = '';
    if (first.includes('https://api.github.com/repos/') && first.includes('/git/trees/')) description = 'Passes a GitHub file tree API URL to a function.';
    else if (first.includes('https://api.github.com/repos/')) description = 'Passes a GitHub repository metadata API URL to a function.';
    else if (first.includes('https://raw.githubusercontent.com/') && call.name === 'fetch') description = 'Calls fetch with a GitHub raw file URL.';
    else if (call.target && call.name === 'analyze') description = 'Passes the collected value into the project’s analyze function.';
    else if (call.target && call.name === 'load') description = 'Passes the files into the project’s load function.';
    if (description) highlights.push({description, path:fn.path, line:call.line, expression:call.expression || call.name, context:call.context || ''});
  }
  return highlights;
}
export function buildJourney(project, startId, options = {}) {
  const maxDepth = options.maxDepth ?? 2, maxNodes = options.maxNodes ?? 12;
  const byId = new Map(project.functions.map(fn => [fn.id, fn]));
  const start = byId.get(startId);
  if (!start) return {nodes: [], edges: [], unresolved: [], truncated: false};
  const nodes = [], edges = [], unresolved = [], seen = new Set([startId]);
  const queue = [{fn: start, depth: 0}], queued = new Set([startId]);
  let truncated = false;
  while (queue.length) {
    const {fn, depth} = queue.shift();
    nodes.push({...fn, depth, highlights: highlightsFor(fn)});
    for (const call of fn.calls) {
      const evidence = {from: fn.id, path: fn.path, line: call.line, expression: call.expression || call.name, name: call.name, context: call.context || '', evidenceKind:'static-call'};
      if (!call.target || !byId.has(call.target)) { unresolved.push(evidence); continue; }
      edges.push({...evidence, to: call.target});
      if (depth < maxDepth && !seen.has(call.target)) {
        if (queued.size < maxNodes) {seen.add(call.target); queued.add(call.target); queue.push({fn: byId.get(call.target), depth:depth+1});}
        else truncated = true;
      } else if (depth >= maxDepth && !seen.has(call.target)) truncated = true;
    }
  }
  return {nodes, edges, unresolved, truncated};
}
