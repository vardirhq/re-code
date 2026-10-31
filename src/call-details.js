export function callDetails(call, sourceText) {
  return {
    source: sourceText.split('\n')[call.line - 1] ?? '',
    message: call.target
      ? 'A definition was found in the imported project. Follow it to explore further.'
      : 'RE:CODE could not determine a definition from the imported files. It may belong to JavaScript, an external library, or code that cannot be resolved statically.',
    target: call.target,
  };
}
