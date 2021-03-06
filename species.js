/* eslint-disable import/extensions */
import Critter from './critter.js';
import { globals } from './globals.js';
import { state } from './state.js';
import { determineEnergyInCollision } from './physics.js';

// TODO: Should this be part of the class?
const drawCrittersGroup = (
  shape,
  numberOfCritters,
  pixelsPerXAxis,
  pixelsPerYAxis,
  spacingPerCritter,
  critterSize,
  xOffset,
  yOffset,
) => {
  const critterPositions = [];
  const shapePixelsPerAxis = 30;
  switch (shape) {
    case 'square_filled': {
      const crittersInAxis = Math.ceil(Math.sqrt(numberOfCritters));

      for (let x = 0; x < crittersInAxis; x += 1) {
        for (let y = 0; y < crittersInAxis; y += 1) {
          const xPos =
            xOffset +
            spacingPerCritter * (shapePixelsPerAxis / crittersInAxis) * x;
          const yPos =
            yOffset +
            spacingPerCritter * (shapePixelsPerAxis / crittersInAxis) * y;
          critterPositions.push({ x: xPos, y: yPos });
        }
      }
      return critterPositions;
    }
    case 'circle_empty': {
      const radsPerCritter = (2 * Math.PI) / numberOfCritters;
      for (let j = 0; j < numberOfCritters; j++) {
        critterPositions.push({
          x: xOffset + shapePixelsPerAxis * Math.sin(radsPerCritter * j),
          y: yOffset + shapePixelsPerAxis * Math.cos(radsPerCritter * j),
        });
      }
      return critterPositions;
    }
    case 'circle_filled': {
      const crittersPerRing = [0, 1];
      let crittersPlaced = 1;
      // Work out the critters per radius
      while (crittersPlaced < numberOfCritters) {
        const remainingCritters = numberOfCritters - crittersPlaced;
        let desiredNextRing = Math.min(
          crittersPerRing[crittersPerRing.length - 1] + 2,
          remainingCritters,
        );
        // We don't want subsequent rings to be smaller than current ones
        if (remainingCritters - desiredNextRing < desiredNextRing) {
          desiredNextRing += remainingCritters - desiredNextRing;
        }
        crittersPerRing.push(desiredNextRing);
        crittersPlaced = crittersPerRing.reduce((total, sum) => total + sum);
      }
      // Generate the different number of radii
      let radii = [...Array(crittersPerRing.length).keys()];
      radii = radii.map((r) => r + 1);

      for (let i = 0; i < crittersPerRing.length; i += 1) {
        const radsPerCritter = (2 * Math.PI) / crittersPerRing[i];
        for (let j = 0; j < crittersPerRing[i]; j += 1) {
          const radius = radii[i];
          const angle = j * radsPerCritter;
          critterPositions.push({
            x: xOffset + 2 * radius * Math.cos(angle),
            y: yOffset + 2 * radius * Math.sin(angle),
          });
        }
      }

      return critterPositions;
    }

    case 'chevron': {
      const crittersPerEdge = Math.ceil(numberOfCritters / 3);
      for (let j = 0; j < crittersPerEdge; j += 1) {
        // top left to middle right
        critterPositions.push({
          x: xOffset + j * (shapePixelsPerAxis / crittersPerEdge),
          y: yOffset + j * 0.5 * (shapePixelsPerAxis / crittersPerEdge),
        });

        // middle right to bottom left
        critterPositions.push({
          x:
            xOffset +
            shapePixelsPerAxis -
            j * (shapePixelsPerAxis / crittersPerEdge),
          y:
            yOffset +
            shapePixelsPerAxis / 2 +
            j * (shapePixelsPerAxis / crittersPerEdge),
        });
      }
      return critterPositions;
    }
    case 'triangle_empty': {
      const crittersPerEdge = Math.ceil(numberOfCritters / 3);
      for (let j = 0; j < crittersPerEdge; j += 1) {
        // bottom left to middle top
        critterPositions.push({
          x: xOffset + j * 0.5 * (shapePixelsPerAxis / crittersPerEdge),
          y:
            yOffset +
            shapePixelsPerAxis -
            j * (shapePixelsPerAxis / crittersPerEdge),
        });

        // middle top to bottom right
        critterPositions.push({
          x:
            xOffset +
            shapePixelsPerAxis / 2 +
            j * 0.5 * (shapePixelsPerAxis / crittersPerEdge),
          y: yOffset + j * (shapePixelsPerAxis / crittersPerEdge),
        });

        // bottom edge
        critterPositions.push({
          x: xOffset + j * (shapePixelsPerAxis / crittersPerEdge),
          y: yOffset + shapePixelsPerAxis,
        });
      }
      return critterPositions;
    }

    case 'spiral': {
      const minCrittersPerRing = 5;
      const numberOfRings = Math.ceil(numberOfCritters / minCrittersPerRing);
      const radsPerCritter = (2 * Math.PI) / minCrittersPerRing;
      for (let x = 1; x < numberOfRings + 1; x += 1) {
        for (let j = 0; j < minCrittersPerRing; j += 1) {
          const randomOffset = (x * Math.PI) / 7;
          critterPositions.push({
            x:
              xOffset +
              spacingPerCritter +
              4 * x * Math.sin(radsPerCritter * j + randomOffset),
            y:
              yOffset +
              spacingPerCritter +
              4 * x * Math.cos(radsPerCritter * j + randomOffset),
          });
        }
      }
      return critterPositions;
    }

    case 'square_empty': {
      const crittersPerEdge = Math.ceil(numberOfCritters / 4);
      for (let j = 0; j < crittersPerEdge; j += 1) {
        critterPositions.push({
          x:
            xOffset +
            spacingPerCritter +
            j * (shapePixelsPerAxis / crittersPerEdge),
          y: yOffset,
        });
        critterPositions.push({
          x: xOffset + shapePixelsPerAxis,
          y:
            yOffset +
            spacingPerCritter +
            j * (shapePixelsPerAxis / crittersPerEdge),
        });
        critterPositions.push({
          x: xOffset,
          y:
            yOffset +
            spacingPerCritter +
            j * (shapePixelsPerAxis / crittersPerEdge),
        });
        critterPositions.push({
          x:
            xOffset +
            spacingPerCritter +
            j * (shapePixelsPerAxis / crittersPerEdge),
          y: yOffset + shapePixelsPerAxis,
        });
      }
      return critterPositions;
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
 * @param  {number} groupShape - the shape of critters in a group
 * @param  {number} direction - the direction a critter travels
 * @param  {number} scaredDirection - the direction a critter turns when scared
 * @param  {number} respawnRate - how frequently are new critters created (0 - 1)
 * @param  {number} critterSpeed -the speed of each critter
 * @param  {number} critterSize - the size of each critter (integer)
 * @param  {number} critterSpacing - the distance around each critter in a group (integer)
 * @param  {number} totalEnergy - the total amount of energy for a species (integer)
 * @param  {number} critterEnergy - the energy used for battle for critter (integer)
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
    groupShape,
    direction,
    scaredBehaviour,
    respawnRate,
    critterSpeed,
    critterSize,
    critterSpacing,
    totalEnergy,
    critterEnergy,
    scaredRadius,
    safetyRadius,
    calmSafetyNumber,
    scaredSafetyNumber,
    description,
    difficulty,
  ) {
    this.id = id;
    this.name = name;
    this.colour = colour;
    this.groupSize = groupSize;
    this.groupShape = groupShape;
    this.direction = direction;
    this.scaredBehaviour = scaredBehaviour;
    this.respawnRate = respawnRate;
    this.critterSpeed = critterSpeed;
    this.critterEnergy = critterEnergy;
    this.critterSize = critterSize;
    this.critterSpacing = critterSpacing;
    this.totalEnergy = totalEnergy;
    this.totalCritters = Math.ceil(this.totalEnergy / this.critterEnergy);
    this.totalGroups = Math.ceil(this.totalCritters / this.groupSize);
    this.scaredRadius = scaredRadius;
    this.safetyRadius = safetyRadius;
    this.calmSafetyNumber = calmSafetyNumber;
    this.scaredSafetyNumber = scaredSafetyNumber;
    this.description = description;
    this.difficulty = difficulty;
  }

  /*
dN/dT = Rmax * N((K-N) / K)
where:
 - Rmax = growth rate
 - N = population size
 - K = carrying capacity (max size)
*/
  respawnCritters() {
    if (state.cycle % 10 === 0) {
      if (this.critters.length === 0) {
        return;
      }
      const rMax = this.respawnRate / globals.respawnRateConstant;
      const N = this.getScore();
      const K = globals.totalSpeciesEnergy;
      const amountOfEnergyLeft = rMax * N * ((K - N) / K);
      const numberOfNewCritters = Math.ceil(
        amountOfEnergyLeft / (this.critterSize * this.critterSpeed),
      );
      if (numberOfNewCritters < 0) {
        return;
      }
      for (let i = 0; i < numberOfNewCritters; i++) {
        const randomCritter = this.critters[
          Math.floor(Math.random() * this.critters.length)
        ];
        const respawnPosition = {
          x: Math.min(
            globals.canvasWidth,
            randomCritter.position.x +
              Math.ceil((Math.random() - 0.5) * 20 * this.critterSpacing),
          ),
          y: Math.min(
            globals.canvasHeight,
            randomCritter.position.y +
              Math.ceil((Math.random() - 0.5) * 20 * this.critterSpacing),
          ),
        };
        // TODO: this seems to fire critters off randomly
        const randomDirection = () => {
          if (Math.random() > 0.85) {
            return this.direction;
          }
          if (Math.random() > 0.5) {
            return this.direction * 1.02;
          }
          return this.direction / 1.02;
        };
        this.critters.push(
          new Critter(
            this,
            respawnPosition,
            randomDirection(),
            this.scaredDirection,
            Math.random() < globals.mutationRate
              ? this.critterSpeed * 1.5
              : randomCritter.speed, // Mutations
            Math.random() < globals.mutationRate
              ? this.critterSize * 1.5
              : randomCritter.size, // Mutations
            Math.random() < globals.mutationRate
              ? this.critterEnergy * 1.5
              : randomCritter.energy, // Mutations
            false,
          ),
        );
      }
    }
  }

  determineCritterPositions() {
    const startX = this.id * (globals.canvasWidth / 2);
    const endX = (this.id + 1) * (globals.canvasWidth / 2);
    const startY = this.id * (globals.canvasHeight / 2);
    const endY = (this.id + 1) * (globals.canvasHeight / 2);

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
            this.groupShape,
            this.groupSize,
            pixelsPerXGroup,
            pixelsPerYGroup,
            this.critterSpacing,
            this.critterSize,
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
        this.critterEnergy,
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
      return distance < Math.floor(c.size) + radius;
    });
  }

  getScore() {
    const score = this.critters.reduce((acc, cv) => acc + cv.energy, 0);
    return score;
  }

  // The actual energy in a region
  getEnergyInRegion(position, radius) {
    const collisionCritters = this.getCrittersInRegion(position, radius);
    return collisionCritters.reduce(
      (acc, cv) => determineEnergyInCollision(cv, position),
      0,
    );
  }

  getScaredCritters() {
    return this.critters.filter((c) => c.scared);
  }
};
export default Species;
