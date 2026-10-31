export function callDetails(call, sourceText) {
  return {
    source: sourceText.split('\n')[call.line - 1] ?? '',
    message: call.explanation || (call.target
      ? 'A definition was found in the imported project. Follow it to explore further.'
      : 'RE:CODE could not determine a definition from the imported files. It may belong to JavaScript, an external library, or code that cannot be resolved statically.'),
    confidence: call.confidence || (call.target ? 'Resolved in project' : 'Syntax only'),
    context: call.context || '',
    arguments: call.arguments || [],
    expression: call.expression || '',
    target: call.target,
  };
}
