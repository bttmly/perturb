"use strict";

class Vehicle {
  constructor() {
    this.position = 0;
    this.occupants = [];
  }

  move() {
    this.position += this.speed;
  }

  board(occupant) {
    if (this.occupants.length < this.maxOccupants) {
      this.occupants.push(occupant);
      return true;
    }
    return false;
  }

  disembark(occupant) {
    var idx = this.occupants.indexOf(occupant);
    if (idx !== -1) {
      this.occupants.splice(idx, 1);
      return occupant;
    }
    return false;
  }
}

Vehicle.prototype.speed = 5;

Vehicle.prototype.maxOccupants = 2;

module.exports = Vehicle;
