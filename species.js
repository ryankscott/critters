/* eslint-disable import/extensions */
import Critter from './critter.js';
import { globals } from './globals.js';
import { state } from './state.js';
import { determineEnergyInCollision } from './physics.js';


const drawCrittersGroup = (
  shape,
  numberOfCritters,
  pixelsPerXAxis,
  pixelsPerYAxis,
  spacingPerCritter,
  xOffset,
  yOffset,
) => {
  const critterPositions = [];
  switch (shape) {
    case 'square_filled': {
      const crittersInAxis = Math.ceil(Math.sqrt(numberOfCritters));
      for (let x = 0; x < crittersInAxis; x += 1) {
        for (let y = 0; y < crittersInAxis; y += 1) {
          const xPos = xOffset + spacingPerCritter * (pixelsPerXAxis / crittersInAxis) * x;
          const yPos = yOffset + spacingPerCritter * (pixelsPerYAxis / crittersInAxis) * y;
          critterPositions.push({ x: xPos, y: yPos });
        }
      }
      return critterPositions;
    }
    case 'square_empty': {
    }
    default:
      break;
  }
  return critterPositions;
};


/**
 *
 * @param  {number} id - a unique identifier
 * @param  {string} name - species name
 * @param  {string} colour - a colour string that will be used for critters
 * @param  {number} groupSize - the maximum number of critters in a group
 * @param  {number} direction - the direction a critter travels
 * @param  {number} scaredDirection - the direction a critter turns when scared
 * @param  {number} respawnRate - how frequently are new critters created (0 - 1)
 * @param  {number} critterSpeed -the speed of each critter
 * @param  {number} critterSize - the size of each critter (integer)
 * @param  {number} critterSpacing - the distance around each critter in a group (integer)
 * @param  {number} scaredRadius - the distance around a critter that's checked for enemy critters to determine if it's scared (integer)
 * @param  {number} safetyRadius - the distance around a critter that's checked for critters to determine if it's safe (integer)
 * @param  {number} calmSafetyNumber - the number of calm critters in a radius before it's considered safe
 * @param  {number} scaredSafetyNumber - the number of scared critters in a radius before it's considered safe
 * @param  {number} maxAge - the number of cycles before a critter dies (integer)
 */

const Species = class {
  constructor(
    id,
    name,
    colour,
    groupSize,
    direction,
    scaredBehaviour,
    respawnRate,
    critterSpeed,
    critterSize,
    critterSpacing,
    scaredRadius,
    safetyRadius,
    calmSafetyNumber,
    scaredSafetyNumber,
    maxAge,
  ) {
    this.id = id;
    this.name = name;
    this.colour = colour;
    this.groupSize = groupSize;
    this.direction = direction;
    this.scaredBehaviour = scaredBehaviour;
    this.respawnRate = respawnRate;
    this.critterSpeed = critterSpeed;
    this.critterSize = critterSize;
    this.critterSpacing = critterSpacing;
    this.totalCritters = Math.ceil(
      globals.totalSpeciesEnergy / (this.critterSpeed * this.critterSize),
    );
    this.totalGroups = Math.ceil(this.totalCritters / this.groupSize);
    this.scaredRadius = scaredRadius;
    this.safetyRadius = safetyRadius;
    this.calmSafetyNumber = calmSafetyNumber;
    this.scaredSafetyNumber = scaredSafetyNumber;
    this.maxAge = maxAge;

    this.generateCritters();
  }

  /*
dN/dT = Rmax * N((K-N) / K)
where:
 - Rmax = growth rate
 - N = population size
 - K = carrying capacity (max size)
*/
  respawnCritters() {
    if (state.cycle % 10 == 0) {
      if (this.critters.length === 0) {
        return;
      }
      const rMax = (this.respawnRate / globals.respawnRateConstant);
      const N = this.getScore();
      const K = globals.totalSpeciesEnergy;
      const amountOfEnergyLeft = (rMax * N * ((K - N) / K));
      const numberOfNewCritters = Math.ceil(amountOfEnergyLeft / (this.critterSize * this.critterSpeed));
      if (numberOfNewCritters < 0) {
        return;
      }
      for (let i = 0; i < numberOfNewCritters; i++) {
        const randomCritter = this.critters[Math.floor(Math.random() * this.critters.length)];
        const respawnPosition = {
          x: Math.min(globals.canvasWidth, randomCritter.position.x + Math.ceil((Math.random() - 0.5) * 150 * this.critterSpacing)),
          y: Math.min(globals.canvasHeight, randomCritter.position.y + Math.ceil((Math.random() - 0.5) * 150 * this.critterSpacing)),
        };
        this.critters.push(new Critter(
          this,
          respawnPosition,
          this.direction,
          this.scaredDirection,
          Math.random() < globals.mutationRate ? this.critterSpeed * 1.5 : randomCritter.speed, // Mutations
          Math.random() < globals.mutationRate ? this.critterSize * 1.5 : randomCritter.size, // Mutations
          false,
        ));
      }
    }
  }

  determineCritterPositions() {
    const startX = this.id * (globals.canvasWidth / globals.numberOfSpecies);
    const endX = (this.id + 1) * (globals.canvasWidth / globals.numberOfSpecies);
    const startY = this.id * (globals.canvasHeight / globals.numberOfSpecies);
    const endY = (this.id + 1) * (globals.canvasHeight / globals.numberOfSpecies);

    // Number of groups in each axis
    const maxGroupsPerAxis = Math.ceil(Math.sqrt(this.totalGroups));

    // Number of critters in each group axis
    const pixelsPerXGroup = (endX - startX) / maxGroupsPerAxis;
    const pixelsPerYGroup = (endY - startY) / maxGroupsPerAxis;

    const critterPositions = [];
    for (let i = 0; i < this.totalGroups; i += 1) {
      for (let x = 0; x < maxGroupsPerAxis; x += 1) {
        for (let y = 0; y < maxGroupsPerAxis; y += 1) {
          const xOffset = x * pixelsPerXGroup + startX;
          const yOffset = y * pixelsPerYGroup + startY;

          // Start with a naive approach
          const groupCrittersPositions = drawCrittersGroup(
            'square_filled',
            this.groupSize,
            pixelsPerXGroup,
            pixelsPerYGroup,
            this.critterSpacing,
            xOffset,
            yOffset,
          );
          critterPositions.push(groupCrittersPositions);
        }
      }
    }
    return critterPositions.flat();
  }

  generateCritters() {
    const critterPositions = this.determineCritterPositions();
    const critters = [];
    for (let i = 0; i < this.totalCritters; i += 1) {
      const c = new Critter(
        this,
        critterPositions.pop(),
        this.direction,
        this.scaredBehaviour,
        this.critterSpeed,
        this.critterSize,
        false,
      );
      critters.push(c);
    }
    this.critters = critters;
  }

  /**
   * @param  {{x: number, y: number}} position - the position that critters will be searched from
   * @param  {number} radius - the radius which will be searched for critters
   */
  getCrittersInRegion(position, radius) {
    return this.critters.filter((c) => {
      const dx = c.position.x - position.x;
      const dy = c.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (Math.floor(c.size) + (radius));
    });
  }

  getScore() {
    const score = this.critters.reduce((acc, cv) => (acc + cv.energy), 0);
    return score;
  }

  getEnergyInRegion(position, radius) {
    const collisionCritters = this.getCrittersInRegion(position, radius);
    return collisionCritters.reduce((acc, cv) => (determineEnergyInCollision(cv, position)), 0);
  }

  getScaredCritters() {
    return this.critters.filter(c => c.scared);
  }
};
export default Species;
