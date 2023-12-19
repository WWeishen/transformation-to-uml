'use strict';
const ts = require('typescript');
const fs = require('fs')
const toPUml = require('./toUML/topu.js');
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
                      .reduce((pv, child) => {//union
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
let visit = (parent,root) => node => {
    //let test = customStringify(node);console.log(test);
    switch (node.kind) {
        case ts.SyntaxKind.NamedExports:
            console.log("typeLiteral: "+node.getText())
            break;
        case ts.SyntaxKind.ModuleDeclaration:
            let moduleName = node.name.text;
            ts.forEachChild(node, visit(parent.addChildren(moduleName),root));
            break;
        case ts.SyntaxKind.ModuleBlock:
            ts.forEachChild(node, visit(parent,root));
            break;
        case ts.SyntaxKind.InterfaceDeclaration:    //Structure
            let interfaceName = node.name.text;
            parent[interfaceName] = {};     //creat since the root
            ts.forEachChild(node, visit(parent.addChildren(interfaceName),root));
            break;
        case ts.SyntaxKind.TypeAliasDeclaration:        
            if(node.type.kind === ts.SyntaxKind.UnionType){//Distribution
                let TypeAliasDeclarationName = node.name.text;
                parent[TypeAliasDeclarationName] = {};  //creat since the root
                ts.forEachChild(node, visit(parent.addChildren(TypeAliasDeclarationName),root));
            }
            break;
        case ts.SyntaxKind.UnionType:                   
                for(var i=0; i<node.types.length ; i++){//Types for distribution
                    if(node.types[i].typeName){
                        ts.forEachChild(parent.addChildren(node.types[i].typeName.text));
                    }
                    else{//Enum value for enumType
                        ts.forEachChild(parent.addChildren("\"" + node.types[i].literal.text + "\""));
                    }
                }
            break;         
        case ts.SyntaxKind.PropertySignature:   //Element including in a structure
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
            if (propertyType.kind === ts.SyntaxKind.TypeReference) {    //reference
                let realPropertyType = propertyType;
                let type = getNonPrimitiveArrayType(arrayDeep, realPropertyType);//Type is a reference to another structure
                if (type.includes("undefined")){
                    type = 'Array<'+getPrimmitiveTypeName(propertyType.typeArguments[0])+'>';//if not found then search in PROPERTY_TYPES
                }
                parent.addChildren(realPropertyName,type);
            } else if(propertyType.kind === ts.SyntaxKind.UnionType && propertyName.text != "$container"){ //enumType
                let name = propertyName.text; 
                let type = 'Enum<' + name + "Type" + '>'; 
                parent.addChildren(name, type);

                let currentPosition = { parent, node };
                //add an interface "EnumType" since the root
                parent = root;
                let EnumName = name + "Type" ;
                parent[EnumName] = {};
                ts.forEachChild(node, visit(parent.addChildren(EnumName,'Enum'),root));
                //go back to position recoding
                parent = currentPosition.parent;
                node = currentPosition.node;
            }
            else {  //Type is none of Non-terminaux
                if(getPrimmitiveTypeName(propertyType)){     //Primmitive Type
                    parent.addChildren(realPropertyName, getPrimmitiveTypeName(propertyType));
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
    program.getSourceFiles().forEach((f) => {
        if (f.fileName == filename){
            let sourceFile = f; 
            ts.forEachChild(sourceFile, visit(node,node));
            //const root  = node.getObject()[ROOT_NAME];console.log(root);
            let res = toPUml(node);/********************/
            fs.writeFile(filename +".puml", res, (err) => { 
                if(err) { 
                    throw err; 
                }});
                console.log("Data has been written to file successfully.");  
            return node;
        }
    })
}

function getPrimmitiveTypeName(typeKind) {
    for (let type in PROPERTY_TYPES) {
        if (typeKind.kind === PROPERTY_TYPES[type]) {
            return type;
        }
    }
}

function getNonPrimitiveArrayType(arrayDeep, realPropertyType) {
    return 'Array<'.repeat(arrayDeep) +
        (realPropertyType.kind === ts.SyntaxKind.QualifiedName
            ? realPropertyType.typeName.text
            : 'text' in realPropertyType
                ? realPropertyType.typeName.text
                : realPropertyType.typeArguments?.length > 0
                    ? arrayTypeName(realPropertyType)
                    : realPropertyType.typeName.text // model
        ) +
        '>'.repeat(arrayDeep);
}

function arrayTypeName(realPropertyType){
    let argumentType = realPropertyType.typeArguments[0].typeName?.text;
    if(argumentType == 'Reference'){//reference to another structure
        argumentType = realPropertyType.typeArguments[0].typeArguments[0].typeName.text;
    }
    return realPropertyType.typeName.text + "<" + argumentType + ">"
}

// function customStringify(obj, seen = new Set()) {
//     if (typeof obj === 'object' && obj !== null) {
//       if (seen.has(obj)) {
//         return '[Circular Reference]';
//       }
  
//       seen.add(obj);

//       if (Array.isArray(obj)) {
//         const arrayContents = obj.map(item => customStringify(item, seen));
//         return `[${arrayContents.join(', ')}]`;
//       } else {
//         const objectContents = Object.keys(obj).map(key => {
//           const value = customStringify(obj[key], seen);
//           return `${key}: ${value}`;
//         });
//         return `{${objectContents.join(', ')}}`;
//       }
//     } else {
      
//         return JSON.stringify(obj); 
//     }
// }