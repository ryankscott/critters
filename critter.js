/* eslint-disable import/extensions */
import { uuid } from './uuid.js';
import { detectCollisions, determineNextCritterPosition } from './physics.js';
import { globals } from './main.js';
import { lightenHexColour } from './colours.js';

const Critter = class {
  constructor(
    species,
    position,
    direction,
    scaredDirection,
    speed,
    size,
    scared,
  ) {
    this.id = uuid();
    this.species = species;
    this.position = position;
    this.direction = direction;
    this.scaredDirection = scaredDirection;
    this.speed = speed;
    this.size = size;
    this.scared = scared;
    this.age = 0;
  }

  move() {
    this.position = determineNextCritterPosition(
      this.position.x,
      this.position.y,
      this.speed,
      this.direction,
    );
  }

  draw() {
    const circle = new Path2D();
    circle.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    globals.ctx.fillStyle = this.scared ? chroma(this.species.colour).brighten(2).hex() : this.species.colour;
    globals.ctx.fill(circle);
  }
};

export default Critter;
