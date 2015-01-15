function Vehicle () {
  this.position = 0;
  this.passengers = [];
}

Vehicle.prototype.speed = 5;

Vehicle.prototype.maxPassengers = 2;

Vehicle.prototype.move = function () {
  this.position += this.speed;
};

Vehicle.prototype.board = function (passenger) {
  if (this.passengers.length < this.maxPassengers) {
    this.passengers.push(passenger);
    return true;
  }
  return false;
};

Vehicle.prototype.disembark = function (passenger) {
  var idx = this.passengers.indexOf(passenger);
  if (idx !== -1) {
    this.passengers.splice(idx, 1);
    return passenger;
  }
  return false;
};

module.exports = Vehicle;
