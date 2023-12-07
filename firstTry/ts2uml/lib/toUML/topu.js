function toPUml(node){
    for (let i=0; i < node.children.length; i++){
        const elem = node.children[i]
        console.log("class "+elem.name+"{\n}");
        for (let j=0; j < elem.children.length; j++){
            const c = elem.children[j]
            if(c.type != undefined){
                console.log(elem.name, " --> ",c.name, c.type)    
            }else{
                console.log(elem.name, " <|-- ", c.name)
    
            }
        }
    }
}