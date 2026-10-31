import ts from 'typescript';
import { explainCall } from './explain-call.js';

export function analyze(files) {
  const names = Object.keys(files).filter(p => /\.[cm]?[jt]sx?$/.test(p));
  const options = { allowJs: true, jsx: ts.JsxEmit.Preserve, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, noLib: true, noResolve: false };
  const canonical = p => '/' + p.replace(/^\/+/, '');
  const source = new Map(names.map(p => [canonical(p), files[p]]));
  const host = {
    getSourceFile: (name, version) => source.has(name) ? ts.createSourceFile(name, source.get(name), version, true) : undefined,
    getDefaultLibFileName: () => '/lib.d.ts', writeFile() {}, getCurrentDirectory: () => '/', getDirectories: () => [],
    fileExists: name => source.has(name), readFile: name => source.get(name), directoryExists: () => true,
    getCanonicalFileName: name => name, useCaseSensitiveFileNames: () => true, getNewLine: () => '\n',
  };
  const program = ts.createProgram([...source.keys()], options, host);
  const checker = program.getTypeChecker();
  const functions = []; const errors = []; const nodeIds = new Map();
  const filePath = sf => sf.fileName.replace(/^\//, '');
  const loc = (sf, node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
  const isFunction = node => ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) && ts.isVariableDeclaration(node.parent));
  const functionName = node => node.name?.getText() || (ts.isVariableDeclaration(node.parent) ? node.parent.name.getText() : null);
  for (const sf of program.getSourceFiles()) {
    if (!source.has(sf.fileName)) continue;
    if (sf.parseDiagnostics.length) { errors.push({path: filePath(sf), message: ts.flattenDiagnosticMessageText(sf.parseDiagnostics[0].messageText, ' ')}); continue; }
    const walk = node => {
      if (isFunction(node) && node.body && functionName(node)) {
        const name = functionName(node), line = loc(sf, node), path = filePath(sf), id = `${path}:${line}:${name}`;
        const item = { id, name, path, line, endLine: sf.getLineAndCharacterOfPosition(node.end).line + 1, signature: node.getText(sf).split(/\s*\{/)[0].slice(0, 250), calls: [] };
        item.parameters = node.parameters.map(p => p.getText(sf));
        item.returns = []; item.branches = [];
        const inspect = part => {
          if (part !== node.body && ts.isFunctionLike(part)) return;
          if (ts.isReturnStatement(part)) item.returns.push({expression: part.expression?.getText(sf) || '(no value)', line: loc(sf, part)});
          if (ts.isIfStatement(part)) item.branches.push({expression: part.expression.getText(sf), line: loc(sf, part)});
          ts.forEachChild(part, inspect);
        };
        if (ts.isBlock(node.body)) inspect(node.body);
        else item.returns.push({expression: node.body.getText(sf), line: loc(sf, node.body)});
        nodeIds.set(node, id); functions.push(item);
      }
      ts.forEachChild(node, walk);
    }; walk(sf);
  }
  for (const sf of program.getSourceFiles()) {
    if (!source.has(sf.fileName) || sf.parseDiagnostics.length) continue;
    const walk = node => {
      if (nodeIds.has(node)) {
        const item = functions.find(f => f.id === nodeIds.get(node));
        const visit = child => {
          if (child !== node && isFunction(child)) return;
          if (ts.isCallExpression(child) || ts.isNewExpression(child)) {
            const expression = child.expression;
            let sym = checker.getSymbolAtLocation(ts.isPropertyAccessExpression(expression) ? expression.name : expression);
            if (sym && (sym.flags & ts.SymbolFlags.Alias)) { try { sym = checker.getAliasedSymbol(sym); } catch {} }
            const decls = sym?.declarations || [];
            let targets = decls.map(d => nodeIds.get(d) || nodeIds.get(d.initializer)).filter(Boolean);
            targets = [...new Set(targets)];
            const target = targets.length === 1 ? targets[0] : null;
            item.calls.push({name: expression.getText(sf), line: loc(sf, child), target, ...explainCall(child, sf, checker, target)});
          }
          ts.forEachChild(child, visit);
        }; visit(node.body);
      }
      ts.forEachChild(node, walk);
    }; walk(sf);
  }
  return {functions, errors, files};
}
