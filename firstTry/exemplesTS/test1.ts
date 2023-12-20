// Inheritance
class Animal {
    constructor(public name: string) {}

    move(distanceInMeters: number = 0, instance : Dog ) {
        console.log(`${this.name} moved ${distanceInMeters}m.`);
        console.log(`${instance.name}`);
    }
}

class Dog extends Animal {
    constructor(name: string) {
        super(name);
    }

    bark() {
        console.log('Woof! Woof!');
    }
}