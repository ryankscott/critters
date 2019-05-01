/* eslint-disable import/extensions */
import { uuid } from './uuid.js';
import { determineNextCritterPosition } from './physics.js';
import { globals } from './globals.js';

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
    this.energy = this.size * this.speed;
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

  normalise() {
    if (this.speed < this.species.critterSpeed) {
      this.speed = Math.ceil(this.speed *= globals.speedNormalisationConstant);
    } else {
      this.speed = Math.ceil(this.speed /= globals.speedNormalisationConstant);
    }
    if (this.energy < (this.species.critterSpeed * this.species.critterSize)) {
      this.energy = Math.ceil(this.energy *= globals.energyNormalisationConstant);
    } else {
      this.energy = Math.ceil(this.energy /= globals.energyNormalisationConstant);
    }
  }

  calm() {
    const closeCritters = this.species.getCrittersInRegion(this.position, this.species.safetyRadius);
    const closeCalmCritters = closeCritters.filter(cc => !cc.scared);
    // If there's more than X critters nearby they will become calm again
    if ((closeCalmCritters.length > this.species.calmSafetyNumber) || (closeCritters.length > this.species.scaredSafetyNumber)) {
      this.direction = this.species.direction;
      this.speed = this.species.critterSpeed;
      this.scared = false;
    }
  }
};

export default Critter;
