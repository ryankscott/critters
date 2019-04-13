/* eslint-disable no-mixed-operators */
/* eslint-disable import/extensions */
import { state } from './state.js';
import { globals } from './main.js';


const determineEnergyInCollision = (
  critterSize,
  critterSpeed,
  critterPosition,
  collisionPosition,
) => {
  let dist = Math.sqrt((critterPosition.x - collisionPosition.x) ** 2 + (critterPosition.y - collisionPosition.y));
  if (dist < 0.05) { dist = 1; } // TODO: Fix me
  return (critterSize * critterSpeed) / (dist ** 2);
};

const detectCollisions = () => {
  // TODO: Simplify this

  // Start with one species
  state.species.forEach((t, idx) => {
    const otherSpecies = state.species.slice(idx + 1, state.species.length);

    // Loop over scared critters in each species
    const currentlyScaredCritters = t.getScaredCritters();
    currentlyScaredCritters.forEach((c) => {
      const closeCritters = t.getCrittersInRegion(c.position, t.safeRadius);
      const closeCalmCritters = closeCritters.filter(cc => !cc.scared);
      // If there's more than X critters nearby they will become calm again
      if (closeCalmCritters.length > t.safetyNumber) {
        c.direction = closeCalmCritters[0].direction;
        c.conflictDirection = closeCalmCritters[0].conflictDirection;
        c.scared = false;
      }
    });


    // Loop over the critters in the first species
    t.critters.forEach((c) => {
      // Get near collisions
      const currentSpeciesScaredCritters = t.getCrittersInRegion(c.position, t.scaredRadius);
      const otherSpeciesScaredCritters = otherSpecies.map(s => s.getCrittersInRegion(c.position, t.scaredRadius));

      // Iterate over the "other species"
      otherSpeciesScaredCritters.forEach((o, index) => {
        // If there's more than zero critters nearby it means we have a "collision"
        if (o.length > 0) {
          const otherSpeciesScaredEnergy = otherSpecies[index].getEnergyInRegion(c.position, t.scaredRadius);
          const currentSpeciesScaredEnergy = t.getEnergyInRegion(c.position, t.scaredRadius);

          // Current species will be scared
          if (otherSpeciesScaredEnergy > currentSpeciesScaredEnergy) {
            state.species[idx].critters.map((c) => {
              if (currentSpeciesScaredCritters.includes(c)) {
                if (c.scared == false) {
                  const prevDirection = c.direction;
                  c.direction = c.conflictDirection;
                  c.conflictDirection = prevDirection;
                  c.scared = true;
                }
              }
              return c;
            });

            // Other species will be scared
          } else if (otherSpeciesScaredEnergy < currentSpeciesScaredEnergy) {
            const otherSpeciesID = otherSpecies[index].id;
            state.species[otherSpeciesID].critters.map((cs) => {
              if (o.includes(cs)) {
                if (cs.scared == false) {
                  const prevDirection = cs.direction;
                  cs.direction = cs.conflictDirection;
                  cs.conflictDirection = prevDirection;
                  cs.scared = true;
                }
              }
              return cs;
            });
          }
        }
      });

      // Get collisions
      const currentSpeciesCollisionCritters = t.getCrittersInRegion(c.position, globals.collisionRadius);
      const otherSpeciesCollisionCritters = otherSpecies.map(s => s.getCrittersInRegion(c.position, globals.collisionRadius));

      otherSpeciesCollisionCritters.forEach((o, index) => {
        if (o.length > 0) {
          const otherSpeciesEnergy = otherSpecies[index].getEnergyInRegion(c.position, globals.collisionRadius);
          const currentSpeciesEnergy = t.getEnergyInRegion(c.position, globals.collisionRadius);

          if (otherSpeciesEnergy > currentSpeciesEnergy) {
            // Delete currentSpecies
            state.species[idx].critters = t.critters.filter(el => !currentSpeciesCollisionCritters.includes(el));
          } else if (otherSpeciesEnergy < currentSpeciesEnergy) {
            // Delete otherSpecies
            const otherSpeciesIdx = otherSpecies[index].id;
            state.species[otherSpeciesIdx].critters = state.species[otherSpeciesIdx].critters.filter(el => !o.includes(el));
          }

          if (globals.collisionDebug) {
            const debugCircle = new Path2D();
            debugCircle.arc(
              c.position.x,
              c.position.y,
              5,
              0,
              2 * Math.PI,
            );
            globals.ctx.fillStyle = 'rgba(255,255,255,0.6)';
            globals.ctx.fill(debugCircle);
          }
        }
      });
    });


  // Find all critters in the collision
  });
};

const normalisePositionToCanvas = (xPos, yPos) => {
  const { canvasHeight, canvasWidth } = globals;
  let correctedXPos = xPos;
  let correctedYPos = yPos;
  if (xPos > canvasWidth) {
    correctedXPos = xPos - canvasWidth;
  } else if (xPos < 0) {
    correctedXPos = canvasWidth + xPos;
  }
  if (yPos > canvasHeight) {
    correctedYPos = yPos - canvasHeight;
  } else if (yPos < 0) {
    correctedYPos = canvasHeight + yPos;
  }
  return { x: correctedXPos, y: correctedYPos };
};

const determineNextCritterPosition = (xPos, yPos, speed, direction) => {
  // Assume direction is a value between 0 and 2*PI
  /*
            pi/2    /|
              |    / |
              | r /  | y
              |  / x |
   pi --------|-------- 0
              |
              |
              |
          3 * pi / 2
 Assume:
 -  r = our speed
 -  theta is direction


 SOH - sin(theta) = O/H
 CAH  - cos(theta) = A/H
 TOA - tan(theta) = O/A
  */
  const adjustedSpeed = Math.random() > 0.95 ? speed + Math.random() : speed;
  switch (true) {
    case direction < Math.PI / 2:
      return normalisePositionToCanvas(
        xPos - adjustedSpeed * Math.cos(direction),
        yPos + adjustedSpeed * Math.sin(direction),
      );
    case direction > Math.PI / 2 && direction < Math.PI:
      return normalisePositionToCanvas(
        xPos + adjustedSpeed * Math.cos(direction),
        yPos - adjustedSpeed * Math.sin(direction),
      );
    case direction > Math.PI && direction < (3 * Math.PI) / 2:
      return normalisePositionToCanvas(
        xPos - adjustedSpeed * Math.cos(direction),
        yPos + adjustedSpeed * Math.sin(direction),
      );
    case direction > (3 * Math.PI) / 2 && direction < 2 * Math.PI:
      return normalisePositionToCanvas(
        xPos + adjustedSpeed * Math.cos(direction),
        yPos - adjustedSpeed * Math.sin(direction),
      );
    default:
      return normalisePositionToCanvas(
        xPos + adjustedSpeed * Math.cos(direction),
        yPos - adjustedSpeed * Math.sin(direction),
      );
  }
};

export { detectCollisions, determineNextCritterPosition, determineEnergyInCollision };
