import fs from 'fs';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';

const traverse = traverseModule.default || traverseModule;

const files = ['src/components/Symbols.tsx', 'src/components/CanvasEditor.tsx'];
files.forEach(file => {
  const code = fs.readFileSync(file, 'utf8');
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx']
  });

  traverse(ast, {
    JSXText(path) {
      // Babel parsing literal text nodes
      // Often newlines with spaces are parsed as JSXText. React removes them.
      // But if there is a literal space that React keeps...
      if (path.node.value === ' ' || path.node.value === '  ') {
        console.log(`Found explicit space text node in ${file} at line ${path.node.loc.start.line}`);
      }
    },
    JSXExpressionContainer(path) {
       if (path.node.expression.type === 'StringLiteral') {
           if (path.node.expression.value === ' ') {
               console.log(`Found explicit space string expression in ${file} at line ${path.node.loc.start.line}`);
           }
       }
    }
  });
});
