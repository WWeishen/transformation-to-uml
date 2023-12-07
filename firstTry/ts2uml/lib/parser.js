'use strict';
const ts = require('typescript');

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
                      .reduce((pv, child) => {          //union
                          for (let key in child) {
                              if (pv.hasOwnProperty(key) || key in pv) {
                                  if (key != "Number" && key != "Date"){//assign direct
                                    Object.assign(pv[key], child[key]);
                                  }else {
                                    pv[key] = child[key];//union element
                                    }
                              } else {
                                  pv[key] = child[key];//union element
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

//currying function; param is parent, return a function who takes one param 'node'
let visit = parent => node => {
    //let test = customStringify(node);console.log(test);
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
        case ts.SyntaxKind.TypeAliasDeclaration:
            if(node.type.kind === ts.SyntaxKind.UnionType){
                let TypeAliasDeclarationName = node.name.text;
                parent[TypeAliasDeclarationName] = {};
                ts.forEachChild(node, visit(parent.addChildren(TypeAliasDeclarationName)));
            }
            break;
        case ts.SyntaxKind.UnionType:           //192; types:[Assi/VarD .kind = 183 = TypeReference]
            for(var i=0; i<node.types.length ; i++){
                //ts.forEachChild(node, visit(parent.addChildren(node.types[i].typeName.text)));
                ts.forEachChild(parent.addChildren(node.types[i].typeName.text));
            }
            break;
        case ts.SyntaxKind.PropertySignature:
            let propertyName = node.name; 
            let propertyType = node.type;
            let arrayDeep = 0;
            let realPropertyName =
                'string' !== typeof propertyName && 'text' in propertyName
                    ? propertyName.text
                    : propertyName;
            while (propertyType.kind === ts.SyntaxKind.ArrayType) {//if type is array
                arrayDeep++;
                propertyType = propertyType.elementType;
            }
            if (propertyType.kind === ts.SyntaxKind.TypeReference) {
                let realPropertyType = propertyType;
                parent.addChildren(
                    realPropertyName,
                    'Array<'.repeat(arrayDeep) +
                        (realPropertyType.kind === ts.SyntaxKind.QualifiedName
                            ? realPropertyType.typeName.text
                            : 'text' in realPropertyType
                                ? realPropertyType.typeName.text    
                                : realPropertyType.typeArguments?.length > 0 
                                    ? realPropertyType.typeName.text + "<" + realPropertyType.typeArguments[0].typeName.text + ">"
                                    : //realPropertyType.typeName.text + "<" + realPropertyType.typeName.constructor.name + ">"
                                    realPropertyType.typeName.text // model
                        ) + 
                    '>'.repeat(arrayDeep)
                );
            } else {
                for (let type in  PROPERTY_TYPES) {
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

module.exports = function getNode(filename, options) {
    const ROOT_NAME = 'root';
    const node = new TSNode(ROOT_NAME);
    let program = ts.createProgram([filename], options);
    // let checker = program.getTypeChecker();
    // checker.runWithCancellationToken()
    // console.log(checker.getExportsOfModule())
    program.getSourceFiles().forEach((f) => {
        if (f.fileName == filename){
            let sourceFile = f; 
            ts.forEachChild(sourceFile, visit(node));
            const root  = node.getObject()[ROOT_NAME];
            //console.log(root);
            toPUml(node);
            return node;
        }
    })
    // let sourceFile = program.getSourceFiles()[1];
    // ts.forEachChild(sourceFile, visit(node));
    // return node.getObject()[ROOT_NAME];
}


function customStringify(obj, seen = new Set()) {
    if (typeof obj === 'object' && obj !== null) {
      if (seen.has(obj)) {
        // Check objet has been seen ? message "circular Reference".
        return '[Circular Reference]';
      }
  
      seen.add(obj);

      if (Array.isArray(obj)) {
        // It's Array, stringify for each element.
        const arrayContents = obj.map(item => customStringify(item, seen));
        return `[${arrayContents.join(', ')}]`;
      } else {
        // It's object, stringify for each proprity.
        const objectContents = Object.keys(obj).map(key => {
          const value = customStringify(obj[key], seen);
          return `${key}: ${value}`;
        });
        return `{${objectContents.join(', ')}}`;
      }
    } else {
      
        return JSON.stringify(obj); 
    }
}


function toPUml(node) {//node.name="root"
    var resultat="";
    //var className = [];
    for (let i=0; i < node.children.length; i++){
        const elem = node.children[i];
        //className.append(elem.name); 
        resultat += "class "+ elem.name + "{\n";
        let str= selectAttribute(elem);
        resultat += str[0];
        resultat += "}\n";
        resultat += str[1];
    }
    console.log(resultat);
    return resultat;
}

function selectAttribute(elem){
    var str="";
    var attribute="";
    let lastName=[];
    for (let i=0; i < elem.children.length; i++){
        while(lastName.length!=0){
            lastName.pop();
        }
        const c = elem.children[i];

        if(c.type != undefined){
            if(c.type.includes('Array<')){
                let exp = /<([^>]+)>/;
                let match = exp.exec(c.type);
                str += elem.name + "*-->" + "\"" + c.name + "\\n*" + "\"" + match[1] +"\n";
            }
            else{
                switch(c.name){
                    case "$container" :
                        str += "";
                        break;
                    case "left" :
                        str += elem.name + "*--> " + "\"" + c.name  + "\\n1 " + "\"" + c.type + "\n";
                        break;
                    case "ref":
                        let exp = /<([^>]+)>/;
                        let match = exp.exec(c.type);
                        str += elem.name + "--> " + "\"" + c.name + "\\n1" + "\"" + match[1] + "\n";
                        break;
                    default:
                        attribute += c.name + ":" + c.type + "\n";
                }
            }
        }else{
            if(lastName.length != 0){
                str + lastName + "-[hidden]>" + c.name;
                lastName.pop();
            }
            lastName.push(c.name);
            str += elem.name+ " <|-- "+ c.name+"\n";
        }
    }
    return [attribute,str];
}