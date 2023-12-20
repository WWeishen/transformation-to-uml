//Interfaces and References
interface IShape {
    draw(): void;
}

class Circle implements IShape {
    draw() {
        console.log("Circle drawn");
    }
}

class Square implements IShape {
    draw() {
        console.log("Square drawn");
    }
}
