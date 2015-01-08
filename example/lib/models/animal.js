// animal model source

function Animal (numLegs, color) {
  this.numLegs = numLegs;
  this.color = color;
  if (this.color === "brown") {
    this.isBrown = true;
  }
  this.kittens = 2;
}

module.exports = Animal;