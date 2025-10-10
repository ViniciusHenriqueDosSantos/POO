// PARTE 1

class MeansOfTransport{
    constructor(
        public name: string,
    ) {}
    move():void{
        console.log("I am moving!")
    }
}
class Plane extends MeansOfTransport{
    move():void{
        console.log("I am moving flying!")
    }
}
class Car extends MeansOfTransport{
    move():void{
        console.log("I am moving rolling!")
    }
}
class Boat extends MeansOfTransport{
    move():void{
        console.log("I am moving navigating!")
    }
}
const transports: MeansOfTransport[] = [
    new Plane("Boeing"),
    new Car("Corsa"),
    new Boat("Boat")
];

for (const transport of transports) {
    transport.move();
}

//PARTE 1


//PARTE 2

class PaymentMethod {
    constructor(public name: string) {}
    pay(amount: number): void {
        console.log(`Paying ${amount} with generic method`);
    }
}

class Stripe extends PaymentMethod {
    pay(amount: number): void {
        console.log(`Paying ${amount} using Stripe`);
    }
}

class PayPal extends PaymentMethod {
    pay(amount: number): void {
        console.log(`Paying ${amount} using PayPal`);
    }
}

class Pix extends PaymentMethod {
    pay(amount: number): void {
        console.log(`Paying ${amount} using Pix`);
    }
}

const payments: PaymentMethod[] = [
    new Stripe("Stripe"),
    new PayPal("PayPal"),
    new Pix("Pix")
];


for (const method of payments) {
    method.pay(100);
}

// PARTE 2

// PARTE 3

abstract class Document {
    processDocument(): void {
        this.open();
        this.process();
        this.save();
        this.close();
    }

     abstract open(): void;
     abstract process(): void;
     abstract save(): void;
     abstract close(): void;
}

class PowerPoint extends Document {
     open(): void {
        console.log("Abrindo PowerPoint...");
    }
     process(): void {
        console.log("Processando PowerPoint...");
    }
     save(): void {
        console.log("Salvando PowerPoint...");
    }
     close(): void {
        console.log("Fechando PowerPoint...");
    }
}

class Word extends Document {
     open(): void {
        console.log("Abrindo Word...");
    }
     process(): void {
        console.log("Processando Word...");
    }
     save(): void {
        console.log("Salvando Word...");
    }
     close(): void {
        console.log("Fechando Word...");
    }
}

const documents: Document[] = [new PowerPoint(), new Word()];

for (const  document of documents) {
    document.processDocument();
}

// PARTE 3