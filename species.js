/* eslint-disable import/extensions */
import Critter from './critter.js';
import { globals } from './main.js';
import { state } from './state.js';
import { determineEnergyInCollision } from './physics.js';
/**
 *
 * @param  {number} id - a unique identifier
 * @param  {string} name - species name
 * @param  {string} colour - a colour string that will be used for critters
 * @param  {number} groupSize - the maximum number of critters in a group
 * @param  {number} direction - the direction a critter travels
 * @param  {number} scaredDirection - the direction a critter turns when scared
 * @param  {number} aggression
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
    scaredDirection,
    aggression,
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
    this.scaredDirection = scaredDirection;
    this.aggression = aggression;
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
  }

  respawnCritters() {
    if (this.critters.length === 0) {
      return;
    }
    const newCritters = Math.floor(this.critters.length * (1 - Math.E ** (-this.respawnRate * state.cycle)));
    for (let index = 0; index < newCritters; index += 1) {
      const randomCritter = this.critters[Math.floor(Math.random() * this.critters.length)];
      // TODO: Only get non-scared critters
      const respawnPosition = { x: randomCritter.position.x + Math.ceil((Math.random() - 0.5) * 50), y: randomCritter.position.y + Math.ceil((Math.random() - 0.5) * 50) };
      this.critters.push(new Critter(
        this,
        respawnPosition,
        this.direction,
        this.scaredDirection,
        Math.random() < 0.001 ? this.critterSpeed * 1.5 : this.critterSpeed, // Mutations
        this.critterSize < 0.001 ? this.critterSize * 1.5 : this.critterSize, // Mutations
        false,
      ));
    }
  }


  ageCritters() {
    this.critters.map(c => c.age += 1);
  }

  killOldCritters() {
    this.critters = this.critters.filter((c) => {
      const likelihood = (1 - Math.E ** (-(c.age / 10000000) * state.cycle));
      return Math.random() > likelihood;
    });
  }

  /*
   y = C e-kt, k > 0

    Features
      Asymptotic to y = 0 to right
      Passes through (0,C)
      C is the initial value
      Decreasing, but bounded below by y=0
    */

  determineCritterPositions() {
    const startX = this.id * (globals.canvasWidth / globals.numberOfSpecies);
    const endX = (this.id + 1) * (globals.canvasWidth / globals.numberOfSpecies);
    const startY = this.id * (globals.canvasHeight / globals.numberOfSpecies);
    const endY = (this.id + 1) * (globals.canvasHeight / globals.numberOfSpecies);

    // Number of groups in each axis
    const groupsInXY = Math.ceil(Math.sqrt(this.totalGroups));

    // Number of critters in each group axis
    const crittersInXY = Math.ceil(Math.sqrt(this.groupSize));

    const numberOfPixelsInXGroup = (endX - startX) / groupsInXY;
    const numberOfPixelsInYGroup = (endY - startY) / groupsInXY;

    const critterPositions = [];
    for (let i = 0; i < this.totalGroups; i += 1) {
      // Randomly pick a cell to start off in
      // TODO: Fix if it's already a populated cell
      const xCell = Math.floor(Math.random() * groupsInXY);
      const yCell = Math.floor(Math.random() * groupsInXY);

      // Start with a naive approach
      for (let x = 0; x < crittersInXY; x += 1) {
        for (let y = 0; y < crittersInXY; y += 1) {
          const xPos = startX // Start of the species area
            + xCell * numberOfPixelsInXGroup // Get the start of the cell
            + 0.5 * numberOfPixelsInXGroup // Start at the middle of the cell
            + this.critterSpacing * (numberOfPixelsInXGroup / crittersInXY) * x; // Add spacing between critters
          const yPos = startY
            + 0.5 * numberOfPixelsInYGroup
            + yCell * numberOfPixelsInYGroup
            + this.critterSpacing * (numberOfPixelsInXGroup / crittersInXY) * y;
          critterPositions.push({ x: xPos, y: yPos });
        }
      }
    }
    return critterPositions;
  }

  generateCritters() {
    const critterPositions = this.determineCritterPositions();
    const critters = [];
    for (let i = 0; i < this.totalCritters; i += 1) {
      const x = new Critter(
        this,
        critterPositions.pop(),
        this.direction,
        this.scaredDirection,
        this.critterSpeed,
        this.critterSize,
        false,
      );
      critters.push(x);
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
    const score = this.critters.reduce((acc, cv) => (acc + cv.size * cv.speed), 0);
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
