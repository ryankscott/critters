/* eslint-disable import/extensions */
import Critter from './critter.js';
import { globals } from './main.js';
import { state } from './state.js';
import { determineEnergyInCollision } from './physics.js';

const Species = class {
  constructor(
    id,
    name,
    colour,
    groupSize,
    direction,
    conflictDirection,
    aggression,
    respawnRate,
    critterSpeed,
    critterSize,
    critterSpacing,
    scaredRadius,
    safetyRadius,
    safetyNumber,
  ) {
    this.id = id;
    this.name = name;
    this.colour = colour;
    this.groupSize = groupSize;
    this.direction = direction;
    this.conflictDirection = conflictDirection;
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
    this.safetyNumber = safetyNumber;
  }

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
        this.conflictDirection,
        this.critterSpeed,
        this.critterSize,
        false,
      );
      critters.push(x);
    }
    this.critters = critters;
  }

  getCrittersInRegion(position, radius) {
    return this.critters.filter((c) => {
      const dx = c.position.x - position.x;
      const dy = c.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (Math.floor(c.size) + (2 * radius));
    });
  }

  getScore() {
    const score = this.critters.reduce((acc, cv) => (acc + cv.size * cv.speed), 0);
    return score;
  }

  getEnergyInRegion(position, radius) {
    const collisionCritters = this.getCrittersInRegion(position, radius);
    return collisionCritters.reduce((acc, cv) => (determineEnergyInCollision(cv.size, cv.speed, cv.position, position)), 0);
  }

  getScaredCritters() {
    return this.critters.filter(c => c.scared);
  }
};
export default Species;
