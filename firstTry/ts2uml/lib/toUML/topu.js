function isClassName(node,name){
    return node.children.some(element => element.name === name);
}

function isCContainer(node, cName) {
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

function isContainer(node,elem,c){
    let result="";
    node.children.forEach(element => {
        if (!isCContainer(node, c) && element.name != elem.name) {
            result = "*";
        }
    });

    return result;
}

function toPUml(node) {//node.name="root"
    var resultat="";
    for (let i=0; i < node.children.length; i++){
        const elem = node.children[i];
        resultat += "class "+ elem.name + "{\n";
        let str= selectAttribute(node,elem);
        resultat += str[0];
        resultat += "}\n";
        resultat += str[1];
    }
    //console.log(resultat);
    return resultat;
}

function selectAttribute(node,elem){
    var str="";
    var attribute="";
    var lastName=[];
    for (let i=0; i < elem.children.length; i++){
        const c = elem.children[i];
        while(lastName.length !=0){lastName.pop();}
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
            }else if(isClassName(node,c.type)){
                if(c.name != "$container"){
                    str += elem.name + "*--> " + "\"" + c.name  + "\\n1 " + "\"" + c.type + "\n";
                }
            }
            else{
                attribute += c.name + ":" + c.type + "\n";
            }
        }
        else{
            if(lastName.length != 0){
                str + lastName[0] + "-[hidden]>" + c.name;
                lastName.pop();
            }else{
                lastName.push(c.name);
            }
            str += elem.name+ " <|-- "+ c.name+"\n";
        }
    }
    return [attribute,str];
}

module.exports = toPUml;