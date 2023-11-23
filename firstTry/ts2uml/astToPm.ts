class Attribut{
    name: String;
    type: String;

    constructor(name,type){
        this.name = name;
        this.type = name;
    }
}

class Class{
    name: String;
    attribut : Attribut[];

    addAttribut;
    getName;

    constructor(name) {
        this.name = name;
        this.attribut = [];
        this.addAttribut = (name, type) => {
            let att = new Attribut(name, type);
            this.attribut.push(att);
            return att;
        };
        
        this.getName = () => this.name;
    }
}

enum RelationType{
    CHILD, SIBLING, FLECHE,
}

class Relation{
    class1 : Class;
    class2 : Class;
    relation : RelationType;
    notation : String;
}


let visit = parent => object =>{
    //1 classe :
    let key in parent{

    } 
}