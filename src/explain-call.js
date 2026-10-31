import ts from 'typescript';

const common = {
  filter: 'If this is the standard array method, filter creates a new array containing the elements for which its callback returns a truthy value.',
  map: 'If this is the standard array method, map creates a new array by applying its callback to each element.',
  flatMap: 'If this is the standard array method, flatMap applies its callback and flattens the results by one level.',
  find: 'If this is the standard array method, find returns the first element that satisfies its callback, or undefined.',
  forEach: 'If this is the standard array method, forEach invokes its callback for each element and returns undefined.',
  includes: 'If this is the standard string or array method, includes checks whether the value is present.',
  endsWith: 'If this is the standard string method, endsWith checks whether the string ends with the given text.',
  startsWith: 'If this is the standard string method, startsWith checks whether the string starts with the given text.',
  split: 'If this is the standard string method, split divides a string into an array using the supplied separator.',
  join: 'If this is the standard array method, join combines its elements into a string.',
  test: 'If the receiver is a regular expression, test checks whether its argument matches the pattern.',
  then: 'If the receiver is a promise, then registers a callback to run after it resolves.',
};
const globals = {
  'Object.keys': 'If Object refers to the JavaScript built-in, Object.keys returns an array of the object’s own enumerable property names.',
  'Object.entries': 'If Object refers to the JavaScript built-in, Object.entries returns pairs of an object’s own enumerable property names and values.',
  'Object.values': 'If Object refers to the JavaScript built-in, Object.values returns the object’s own enumerable property values.',
  'JSON.parse': 'If JSON refers to the JavaScript built-in, JSON.parse converts JSON text into a JavaScript value.',
  'JSON.stringify': 'If JSON refers to the JavaScript built-in, JSON.stringify converts a value into JSON text.',
  'Array.isArray': 'If Array refers to the JavaScript built-in, Array.isArray checks whether a value is an array.',
};
export function explainCall(node, sf, checker, target) {
  const expr = node.expression, name = expr.getText(sf), args = (node.arguments || []).map(x => x.getText(sf));
  let context = '', parent = node.parent;
  while (parent && !ts.isFunctionDeclaration(parent) && !ts.isMethodDeclaration(parent)) {
    if (ts.isArrowFunction(parent) || ts.isFunctionExpression(parent)) { context = 'Inside a callback or nested function; it runs only if that function is invoked.'; break; }
    parent = parent.parent;
  }
  let explanation = target ? 'The call resolves to a function in this project. Follow its definition to inspect what it does.' : 'This calls the expression shown in the source. Its definition could not be determined from the imported files.';
  let confidence = target ? 'Resolved in project' : 'Syntax only';
  if (!target && ts.isPropertyAccessExpression(expr)) {
    const receiver = expr.expression;
    if (globals[name] && ts.isIdentifier(receiver) && !checker.getSymbolAtLocation(receiver)?.declarations?.length) {
      explanation = globals[name]; confidence = 'Possible JavaScript built-in';
    } else if (common[expr.name.text]) {
      explanation = common[expr.name.text]; confidence = 'Possible standard method';
    }
  }
  const pos = sf.getLineAndCharacterOfPosition(node.end);
  return {arguments: args, expression: node.getText(sf), endLine: pos.line + 1, context, explanation, confidence};
}
