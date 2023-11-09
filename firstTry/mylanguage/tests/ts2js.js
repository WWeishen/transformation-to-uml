"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delint = void 0;
var ts = require("typescript");
function delint(sourceFile) {
    delintNode(sourceFile);
    function delintNode(node) {
        switch (node.kind) {
            case ts.SyntaxKind.
            :
            case ts.SyntaxKind.ExpressionStatement:
            case ts.SyntaxKind.NumberKeyword: { }
            case ts.SyntaxKind.VariableStatement:
        }
    }
}
exports.delint = delint;
var sourceFile = ts.createSourceFile("ast.ts", sourceCode, ts.ScriptTarget.Latest, true);
