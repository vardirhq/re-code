import { buildJourney } from './journey.js';

export function readableName(name) {
  const words = name.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim();
  return words ? words[0].toUpperCase() + words.slice(1) : 'Unnamed part';
}

export function createBeginnerSummary(project, startId) {
  const journey = buildJourney(project, startId);
  const start = journey.nodes[0];
  if (!start) return {explained:false, steps:[]};
  const steps = [];
  for (const node of journey.nodes) {
    for (const h of node.highlights) {
      let text = '';
      if (h.description.includes('repository metadata')) text = 'It appears to ask GitHub for information about the project.';
      else if (h.description.includes('file tree')) text = 'It appears to ask GitHub for the project’s list of files.';
      else if (h.description.includes('raw file')) text = 'It appears to request the contents of a file from GitHub.';
      else if (h.description.includes('load function')) text = 'It passes information to another part of the app.';
      else if (h.description.includes('analyze function')) text = 'It passes information to a part named analyze.';
      if (text) steps.push({text, path:h.path, line:h.line, expression:h.expression, functionId:node.id, context:h.context});
    }
  }
  // These messages describe recognized source patterns, not a verified execution path.
  return {explained:steps.length > 0, steps, truncated:journey.truncated};
}
