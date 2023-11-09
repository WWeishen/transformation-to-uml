import  ts from 'typescript';

const PROPERTY_TYPES = {
    any: ts.SyntaxKind.AnyKeyword,
    boolean: ts.SyntaxKind.BooleanKeyword,
    number: ts.SyntaxKind.NumberKeyword,
    string: ts.SyntaxKind.StringKeyword,
};

class TSNode {
    constructor(name, type) {
        this.children = [];
        this.addChildren = (name, type) => {
            let node = new TSNode(name, type);
            this.children.push(node);
            return node;
        };
        this.getType = () => this.type;
        this.getObject = () => {
            let map = {};
            map[this.name] = this.children.length
                ? this.children
                      .map(child => child.getObject())
                      .reduce((pv, child) => {
                          for (let key in child) {
                              if (pv.hasOwnProperty(key) || key in pv) {
                                  if (key != "Number" && key != "Date"){
                                    // console.log("key:"+key);
                                    Object.assign(pv[key], child[key]);
                                  }else {
                                    pv[key] = child[key];
                                    }
                              } else {
                                  pv[key] = child[key];
                              }
                          }
                          return pv;
                      }, {})
                : this.type;
            return map;
        };
        this.name = name;
        this.type = type;
    }
}
let visit = parent => node => {
    // console.log("node text: "+node.getText())
    switch (node.kind) {
        case ts.SyntaxKind.NamedExports:
            console.log("typeLiteral: "+node.getText())
            break;
        case ts.SyntaxKind.ModuleDeclaration:
            let moduleName = node.name.text;
            ts.forEachChild(node, visit(parent.addChildren(moduleName)));
            break;
        case ts.SyntaxKind.ModuleBlock:
            ts.forEachChild(node, visit(parent));
            break;
        case ts.SyntaxKind.InterfaceDeclaration:
            let interfaceName = node.name.text;
            parent[interfaceName] = {};
            ts.forEachChild(node, visit(parent.addChildren(interfaceName)));
            break;
        case ts.SyntaxKind.PropertySignature:
            let propertyName = node.name;
            let propertyType = node.type;
            let arrayDeep = 0;
            let realPropertyName =
                'string' !== typeof propertyName && 'text' in propertyName
                    ? propertyName.text
                    : propertyName;
            while (propertyType.kind === ts.SyntaxKind.ArrayType) {
                arrayDeep++;
                propertyType = propertyType.elementType;
            }
            if (propertyType.kind === ts.SyntaxKind.TypeReference) {
                //console.log('tr '+ JSON.stringify(propertyType));

                let realPropertyType = propertyType.typeName;
                parent.addChildren(
                    realPropertyName,
                    'Array<'.repeat(arrayDeep) +
                        (realPropertyType.kind === ts.SyntaxKind.QualifiedName
                            ? realPropertyType.getText()
                            : 'text' in realPropertyType
                              ? realPropertyType.text
                              : realPropertyType) +
                        '>'.repeat(arrayDeep)
                );
            } else {
                for (let type in PROPERTY_TYPES) {
                    if (propertyType.kind === PROPERTY_TYPES[type]) {
                        parent.addChildren(realPropertyName, type);
                        break;
                    }
                }
            }
            break;
        default:
    }
};

export function doIt(filename, options) {
    const ROOT_NAME = 'root';
    const node = new TSNode(ROOT_NAME);

    let program = ts.createProgram([filename], options);
    let checker = program.getTypeChecker();
    // checker.runWithCancellationToken()
    // console.log(checker.getExportsOfModule())
    program.getSourceFiles().forEach((f) => {
        if (f.fileName == filename){
            let sourceFile = f;
            ts.forEachChild(sourceFile, visit(node));
            console.log(node.getObject()[ROOT_NAME])
        }
    })
    // let sourceFile = program.getSourceFiles()[1];

    // ts.forEachChild(sourceFile, visit(node));

    // return node.getObject()[ROOT_NAME];
}

module.exports = doIt