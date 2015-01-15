var Vehicle = require("./vehicle");

function Car (make, model) {
  Vehicle.call(this);
  this.make = make;
  this.model = model;
}

Car.prototype = Object.create(Vehicle.prototype);

Car.prototype.constructor = Car;

Car.prototype.maxPassengers = 5;

Car.prototype.speed = 10;

Car.prototype.getDriver = function () {
  if (this.passengers.length) {
    return this.passengers[0];
  }
  return null;
};

Car.prototype.getPassengers = function () {
  if (this.passengers.length > 1) {
    return this.passengers.slice(1);
  }
  return null;
};

module.exports = Car;