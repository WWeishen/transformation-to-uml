function isClassName(node,name){
    return node.children.some(element => element.name === name);
}

function isCContainer(node, cName) { //if attributes contain $container
    for (let i = 0; i < node.children.length; i++) {
        const element = node.children[i];
        if (element.name === cName) {
            for (let j = 0; j < element.children.length; j++) {
                if (element.children[j].name == "$container") {
                    return true;
                }
            }
        }
    }
    return false;
}

function isContainer(node,elem,c){ //definite symbol "*"
    let result="";
    node.children.forEach(element => {
        if (!isCContainer(node, c) && element.name != elem.name) {
            result = "*";
        }
    });

    return result;
}

function toPUml(node) {//node.name="root"
    var resultat="@startuml\n";
    for (let i=0; i < node.children.length; i++){
        const elem = node.children[i];
        //Class
        if(elem.type?.includes('Enum')){
            resultat += "enum "+ elem.name + "{\n";     //enum definition

        }else{
            resultat += "class "+ elem.name + "{\n";    //class definition

        }
        let str= selectAttribute(node,elem);
        resultat += str[0]; //attribute definition
        resultat += "}\n";
        resultat += str[1]; //relations between classes information
    }
    //console.log(resultat);
    return resultat+"@enduml";
}

function selectAttribute(node,elem){
    var str="";
    var attribute="";
    var lastName=[];
    for (let i=0; i < elem.children.length; i++){
        const c = elem.children[i];
        if(c.type != undefined){
            if(c.type.includes('Array<')){
                let exp = /<([^>]+)>/;
                let match = exp.exec(c.type);
                str += elem.name + isContainer(node,elem,c) + "-->" + "\"" + c.name + "\\n0...*" + "\"" + match[1] +"\n";
            }
            else if(c.type.includes('Reference<')){
                let exp = /<([^>]+)>/;
                let match = exp.exec(c.type);
                str += elem.name + "--> " + "\"" + c.name + "\\n0...1" + "\"" + match[1] + "\n";
            }
            else if(c.type.includes('Enum<')){
                let exp = /<([^>]+)>/;
                let match = exp.exec(c.type);
                attribute += c.name +":"+ match[1] + "\n"
            }
            else if(isClassName(node,c.type)){
                if(c.name != "$container"){
                    str += elem.name + "*--> " + "\"" + c.name  + "\\n1 " + "\"" + c.type + "\n";
                }
            }
            else if(c.type=='Constructor' || c.type == 'Method'){
                let paramList = "";
                c.children.forEach(param => {
                    paramList += param.name + ":" + param.type+ ",";
                    if(isClassName(node,param.type)){
                        str += elem.name + "\"1\"" + "--> " + "\"param : "+ param.name + "\" " + param.type +  "\n";
                    }
                });
                paramList = paramList.slice(0, -1);
                attribute += c.name + "(" + paramList + ")\n";
            }
            else if(c.type == 'Heritage'){
                str += c.name + " <|-- " + elem.name +"\n";  //Inheritance relation
            }
            else{
                attribute += c.name + ":" + c.type + "\n";
            }
        }
        else{//Distibution
            if(elem.type == 'Enum'){
                attribute += c.name + "\n";
            }else{
                if(lastName.length != 0){
                    str += lastName[0] + "-[hidden]>" + c.name + "\n";//sibling relation
                    lastName.pop();
                }else{
                    lastName.push(c.name);
                }
                str += elem.name + " <|-- " + c.name+"\n";  //Inheritance relation
            }
            
        }
    }
    return [attribute,str];
}

module.exports = toPUml;