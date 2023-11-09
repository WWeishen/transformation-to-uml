import { readFileSync } from "fs";
import * as ts from "typescript";

export function delint(sourceFile: ts.SourceFile) {
    delintNode(sourceFile);
  
    function delintNode(node: ts.Node) {
      switch (node.kind) {
        case ts.SyntaxKind.
        case ts.SyntaxKind.ExpressionStatement
        case ts.SyntaxKind.NumberKeyword{}
        case ts.SyntaxKind.VariableStatement
      }}}

const sourceFile = ts.createSourceFile(
    "ast.ts",
    sourceCode,
    ts.ScriptTarget.Latest,
    true
);