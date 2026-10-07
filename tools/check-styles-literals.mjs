#!/usr/bin/env node
/**
 * Fail on a backtick inside a component's `styles:` or `template:` literal.
 *
 * This uses the TypeScript AST to find actual `styles` and `template` properties
 * rather than relying on regex, avoiding false positives in JS/TS comments.
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = process.argv[2] ?? 'libs/ui-kit/src';

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.ts$/.test(e.name)) files.push(p);
  }
};
walk(root);

const problems = [];

function checkLiteral(literal, propertyName, sourceFile) {
  const body = literal.getText(sourceFile);
  const cssOpen =
    propertyName === 'styles' ? (body.match(/\/\*/g) || []).length : 0;
  const cssClose =
    propertyName === 'styles' ? (body.match(/\*\//g) || []).length : 0;
  const htmlOpen = (body.match(/<!--/g) || []).length;
  const htmlClose = (body.match(/-->/g) || []).length;

  if (cssOpen > cssClose || htmlOpen > htmlClose) {
    const { line } = ts.getLineAndCharacterOfPosition(
      sourceFile,
      literal.getEnd(),
    );
    problems.push(
      `${sourceFile.fileName}:${line + 1}  backtick inside a ${propertyName} literal ends it mid-comment`,
    );
  }
}

function checkNode(node, sourceFile) {
  if (ts.isPropertyAssignment(node)) {
    const name = node.name.getText(sourceFile);
    if (name === 'styles' || name === 'template') {
      if (
        ts.isNoSubstitutionTemplateLiteral(node.initializer) ||
        ts.isTemplateExpression(node.initializer)
      ) {
        checkLiteral(node.initializer, name, sourceFile);
      } else if (ts.isArrayLiteralExpression(node.initializer)) {
        for (const el of node.initializer.elements) {
          if (
            ts.isNoSubstitutionTemplateLiteral(el) ||
            ts.isTemplateExpression(el)
          ) {
            checkLiteral(el, name, sourceFile);
          }
        }
      }
    }
  }
  ts.forEachChild(node, (child) => checkNode(child, sourceFile));
}

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const sourceFile = ts.createSourceFile(
    file,
    src,
    ts.ScriptTarget.Latest,
    true,
  );
  checkNode(sourceFile, sourceFile);
}

if (problems.length) {
  console.error('Backtick(s) inside a styles/template literal:\n');
  problems.forEach((p) => console.error('  ' + p));
  console.error(
    '\nDrop the backticks from the comment — they terminate the literal.',
  );
  process.exit(1);
}

console.log(
  `ok — ${files.length} files, no backticks inside styles/template literals`,
);
