/* eslint-disable import/extensions */
import { determineNextCritterPosition } from './physics.js';
import { globals } from './globals.js';
import {
  uuid,
  degreesToRads,
  distanceBetweenCritters,
  directionTowardsCritter,
} from './utils.js';

const Critter = class {
  constructor(
    species,
    position,
    direction,
    scaredBehaviour,
    speed,
    size,
    energy,
    scared,
  ) {
    this.id = uuid();
    this.species = species;
    this.position = position;
    this.direction = direction;
    this.scaredBehaviour = scaredBehaviour;
    this.speed = speed;
    this.size = size;
    this.energy = energy;
    this.scared = scared;
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
    globals.ctx.fillStyle = this.scared
      ? chroma(this.species.colour)
          .brighten(2)
          .hex()
      : this.species.colour;
    globals.ctx.fill(circle);
  }

  normalise() {
    // speed
    if (this.speed < this.species.critterSpeed) {
      this.speed = Math.ceil(
        (this.speed *= globals.speedNormalisationConstant),
      );
    } else {
      this.speed = Math.ceil(
        (this.speed /= globals.speedNormalisationConstant),
      );
    }
    // energy
    if (this.energy < this.species.critterSpeed * this.species.critterSize) {
      this.energy = Math.ceil(
        (this.energy *= globals.energyNormalisationConstant),
      );
    } else {
      this.energy = Math.ceil(
        (this.energy /= globals.energyNormalisationConstant),
      );
    }
  }

  calm() {
    const closeCritters = this.species.getCrittersInRegion(
      this.position,
      this.species.safetyRadius,
    );
    const closeCalmCritters = closeCritters.filter((cc) => !cc.scared);
    // If there's more than X critters nearby they will become calm again
    if (
      closeCalmCritters.length > this.species.calmSafetyNumber ||
      closeCritters.length > this.species.scaredSafetyNumber
    ) {
      this.direction = this.species.direction;
      this.speed = this.species.critterSpeed;
      this.scared = false;
    }
  }

  determineScaredBehaviour() {
    switch (this.scaredBehaviour) {
      case 'do_nothing':
        return this.direction;
      case 'go_backwards':
        return this.direction + degreesToRads(180);
      case 'turn_left':
        return this.direction - degreesToRads(90);
      case 'turn_right': // TODO: seems to be broken
        return this.direction - degreesToRads(270);
      case 'alternate':
        return Math.random() > 0.5
          ? this.direction - degreesToRads(90)
          : this.direction - degreesToRads(270);
      case 'random':
        return degreesToRads(180 * (Math.random() - 0.5));
      case 'nearest_neighbour': {
        if (this.species.critters.length === 1) {
          return this.direction;
        }
        let neighbourRadius = 5;
        const getNearCritters = (rad) =>
          this.species
            .getCrittersInRegion(this.position, rad)
            .filter((cs) => !cs.scared);
        while (getNearCritters(neighbourRadius).length <= 1) {
          // Otherwise it just returns the original critter
          neighbourRadius += 1;
          if (neighbourRadius >= 250) {
            return this.direction;
          }
        }
        const nearCritters = getNearCritters(neighbourRadius);
        nearCritters.splice(nearCritters.indexOf(this), 1); // remove the current critters
        const distances = nearCritters.map((nc) =>
          distanceBetweenCritters(nc, this),
        );
        const minIdx = distances.indexOf(Math.min(...distances));
        const newDirection = directionTowardsCritter(
          this,
          nearCritters[minIdx],
        );
        return newDirection;
      }
      case 'towards_pack': {
        // TODO: seems to be broken
        if (this.species.critters.length === 1) {
          return this.direction;
        }
        let startRadius = 5;
        const getNearCritters = (rad) =>
          this.species
            .getCrittersInRegion(this.position, rad)
            .filter((cs) => !cs.scared);
        while (getNearCritters(startRadius).length <= 20) {
          // Otherwise it just returns the original critter
          startRadius += 1;
          // If it's too sparsely populated
          if (startRadius >= 250) {
            return this.direction;
          }
        }

        const nearCritters = getNearCritters(startRadius);
        nearCritters.splice(nearCritters.indexOf(this), 1); // remove the current critters

        const direction = nearCritters.reduce(
          (p, nc) => p + directionTowardsCritter(nc, this),
          0,
        );
        return direction / nearCritters.length;
      }
      default:
        return this.direction;
    }
  }
};

export default Critter;
