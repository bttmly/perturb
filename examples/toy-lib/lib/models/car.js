"use strict";

const Vehicle = require("./vehicle");

class Car extends Vehicle {
  constructor (make, model) {
    super(make, model);
    this.make = make;
    this.model = model;
  }

  getDriver () {
    if (this.passengers.length) {
      return this.passengers[0];
    }
    return null;
  }


  getPassengers () {
    if (this.passengers.length > 1) {
      return this.passengers.slice(1);
    }
    return null;
  }
}

Car.prototype.maxPassengers = 5;
Car.prototype.speed = 10;

module.exports = Car;