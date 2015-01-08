// animal model source

function Animal (a, b) {
  this.numLegs = a;
  this.color = b;
  if (this.color === "black") {
    this.isBlack = true;
  }
}

module.exports = Animal;