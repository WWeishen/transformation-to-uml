//Composition
class Engine {
    start() {
        console.log("Engine starting...");
    }
}

class Wheels {
    roll() {
        console.log("Wheels rolling...");
    }
}

class Car {
    engine: Engine;
    wheels: Wheels;

    constructor() {
        this.engine = new Engine();
        this.wheels = new Wheels();
    }

    move() {
        this.engine.start();
        this.wheels.roll();
    }
}
