import { uuid } from "./uuid.js";
import { critter } from "./critter.js";
import { globals } from "./main.js";
import { state } from "./state.js";

const team = class {
  constructor(
    id,
    colour,
    groupSize,
    direction,
    conflictDirection,
    aggression,
    respawnRate,
    critterSpeed,
    critterSize,
    critterSpacing
  ) {
    this.id = id;
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
      500 / (this.critterSpeed * this.critterSize)
    );
    this.totalGroups = Math.ceil(this.totalCritters / this.groupSize);
  }

  determineCritterPositions() {
    const startX = this.id * (globals.canvasWidth / globals.numberOfTeams);
    const endX = (this.id + 1) * (globals.canvasWidth / globals.numberOfTeams);
    const startY = this.id * (globals.canvasHeight / globals.numberOfTeams);
    const endY = (this.id + 1) * (globals.canvasHeight / globals.numberOfTeams);

    // Number of groups in each axis
    const groupsInXY = Math.ceil(Math.sqrt(this.totalGroups));

    // Number of critters in each group axis
    const crittersInXY = Math.ceil(Math.sqrt(this.groupSize));

    const numberOfPixelsInXGroup = (endX - startX) / groupsInXY;
    const numberOfPixelsInYGroup = (endY - startY) / groupsInXY;

    const critterPositions = [];
    for (let i = 0; i < this.totalGroups; i++) {
      // Randomly pick a cell to start off in
      // TODO: Fix if it's already a populated cell
      let xCell = Math.floor(Math.random() * groupsInXY);
      let yCell = Math.floor(Math.random() * groupsInXY);

      // Start with a naive approach
      for (let x = 0; x < crittersInXY; x++) {
        for (let y = 0; y < crittersInXY; y++) {
          const xPos =
            startX + // start of the teams area
            xCell * numberOfPixelsInXGroup + // Get the start of the cell
            0.5 * numberOfPixelsInXGroup + // Start at the middle of the cell
            this.critterSpacing * (numberOfPixelsInXGroup / crittersInXY) * x; // Add spacing between critters
          const yPos =
            startY +
            0.5 * numberOfPixelsInYGroup +
            yCell * numberOfPixelsInYGroup +
            this.critterSpacing * (numberOfPixelsInXGroup / crittersInXY) * y;
          critterPositions.push({ x: xPos, y: yPos });
        }
      }
    }
    return critterPositions;
  }

  generateCritters() {
    const critterPositions = this.determineCritterPositions();
    for (let i = 0; i < this.totalCritters; i++) {
      const x = new critter(
        this,
        critterPositions.pop(),
        this.direction,
        this.conflictDirection,
        this.critterSpeed,
        this.critterSize
      );
      state.critters[this.id].push(x);
    }
  }
};

export { team };
