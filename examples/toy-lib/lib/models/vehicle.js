"use strict";

function Vehicle () {
  this.position = 0;
  this.occupants = [];
}

Vehicle.prototype.speed = 5;

Vehicle.prototype.maxOccupants = 2;

Vehicle.prototype.move = function () {
  this.position += this.speed;
};

Vehicle.prototype.board = function (occupant) {
  if (this.occupants.length < this.maxOccupants) {
    this.occupants.push(occupant);
    return true;
  }
  return false;
};

Vehicle.prototype.disembark = function (occupant) {
  var idx = this.occupants.indexOf(occupant);
  if (idx !== -1) {
    this.occupants.splice(idx, 1);
    return occupant;
  }
  return false;
};

// this should force a mutation that fails on require/compile

["a", "b", "c"].reduce(function (acc, ch) {
  acc[ch] = ch.charCodeAt(0);
  return acc;
}, {});

module.exports = Vehicle;
