# Project Roadmap for [Translate BNF Language into UML Diagram]

## Current Features
### TypeScript file
- [x] Feature 1: Representation of attributes in each class.
- [x] Feature 2: Representation of constructor and methods in each class.
- [x] Feature 3: Representation of relationship inheritance between classes.
- [x] Feature 4: Representation of relationship association between classes.
- [x] Feature 5: Representation of relationship implementation between interface and classes.
### BNF language generated by Langium (ast.ts)
- [x] Feature 6: Entry point of the grammar
- [x] Feature 7: Representation of an element referenced to another non-terminal.
- [x] Feature 8: Representation of an array of the type of the other non-terminal.
- [x] Feature 9: Representation of enum type.
- [x] Feature 10: Representation un element of the primzeromitive type i.e. terminal.


## Known Issues and Limitations
- Issue 1: In the representation of the relationship of inclusion, we can not find sufficient information in the ast.ts to recognize whether the sequence can contain zero elements or not 
    for example: 
    (1) It can not recognize the use of '?' and the difference between '*' and '+'.
    (2) 'def' name=ID ('(' args+=DeclaredParameter (',' args+=DeclaredParameter)* ')')? args will only considered as an array of DeclaredParameter, but it can not 
- Issue 2 : Terminaux cloud not be found in the ast.ts.

- Limitation 1 : The parametres in the constructor function should be an attribute of the class
- Limitation 2 : Accessibility level of a class attribute.
    (public attribute : node.parameters[0].kind is 125 ts.SyntaxKind.PublicKeyword)
- Limitation 3 : The interface must be represented differently than the class.