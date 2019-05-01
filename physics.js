/* eslint-disable no-mixed-operators */
/* eslint-disable import/extensions */
import { state } from './state.js';
import { globals } from './globals.js';
import { colourCritters } from './utils.js';


/**
 * Determine the energy that a single critter provides in a collision
 * @param  {{}} critter - the critter who's energy you want to find
 * @param  {{x: number, y:number}} collisionPosition - position where the collision occurred
 */
const determineEnergyInCollision = (
  critter,
  collisionPosition,
) => {
  const dist = Math.sqrt((critter.position.x - collisionPosition.x) ** 2 + (critter.position.y - collisionPosition.y));
  if (dist == 0) { return (critter.energy); }
  return (critter.energy) / (dist / globals.collisionRadius);
};

const detectCollisions = () => {
  // TODO: Simplify this

  // Start with one species
  state.species.forEach((t, idx) => {
    // Loop over the critters in the first species
    const otherSpecies = state.species.slice(idx + 1, state.species.length);
    t.critters.forEach((c) => {
    // Loop over critters in each species in an area
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
                // When scared critters go to their conflict direction, and go at 110% speed
                if (c.scared === false) {
                  c.direction = c.scaredDirection(c); //* ((-1) ** c.species.id);
                  c.scared = true;
                  c.speed = Math.floor(c.speed * globals.speedChangeWhenScared);
                  c.energy = Math.floor(c.energy * globals.energyChangeInConflict);
                }
              }
              return c;
            });

            // Debug
            if (globals.debug) {
              colourCritters(o, 'rgba(0, 255, 0, 0.4)');
              colourCritters(currentSpeciesScaredCritters, 'rgba(255, 0, 0, 0.4)');
              const currentTime = new Date().getTime();
              while (currentTime + 2000 >= new Date().getTime()) {}
            }

            // Other species will be scared
          } else if (otherSpeciesScaredEnergy < currentSpeciesScaredEnergy) {
            const otherSpeciesID = otherSpecies[index].id;
            state.species[otherSpeciesID].critters.map((cs) => {
              if (o.includes(cs)) {
                // When scared critters go to their conflict direction, and go at 110% speed
                if (cs.scared === false) {
                  cs.direction = cs.scaredDirection(cs);// * ((-1) ** c.species.id);
                  cs.scared = true;
                  cs.speed = Math.floor(cs.speed * globals.speedChangeWhenScared);
                  cs.energy = Math.floor(cs.energy * globals.energyChangeInConflict);
                }
              }
              return cs;
            });

            // Debug
            if (globals.debug) {
              colourCritters(o, 'rgba(255, 0, 0, 0.4)');
              colourCritters(currentSpeciesScaredCritters, 'rgba(0, 255, 0, 0.4)');
              const currentTime = new Date().getTime();
              while (currentTime + 2000 >= new Date().getTime()) {}
            }
          }
        }
      });

      // Get collisions
      const currentSpeciesCollisionCritters = t.getCrittersInRegion(c.position, globals.collisionRadius);
      const otherSpeciesCollisionCritters = otherSpecies.map(s => s.getCrittersInRegion(c.position, globals.collisionRadius));

      otherSpeciesCollisionCritters.forEach((o, index) => {
        if (o.length > 0) {
          if (globals.debug) {
            const cc = new Path2D();
            cc.arc(
              c.position.x,
              c.position.y,
              globals.collisionRadius,
              0,
              2 * Math.PI,
            );
            globals.ctx.fillStyle = 'rgba(255,0,0,0.4)';
            globals.ctx.fill(cc);
          }


          const otherSpeciesEnergy = otherSpecies[index].getEnergyInRegion(c.position, globals.collisionRadius);
          const currentSpeciesEnergy = t.getEnergyInRegion(c.position, globals.collisionRadius);

          if (otherSpeciesEnergy > currentSpeciesEnergy) {
            // Delete currentSpecies
            state.species[idx].critters = t.critters.filter(el => !currentSpeciesCollisionCritters.includes(el));
            const otherSpeciesIdx = otherSpecies[index].id;
            state.species[otherSpeciesIdx].critters = state.species[otherSpeciesIdx].critters.map((el) => {
              if (o.includes(el)) {
                el.speed *= globals.speedChangeInConflict;
              }
              return el;
            });
          } else if (otherSpeciesEnergy < currentSpeciesEnergy) {
            // Delete otherSpecies
            const otherSpeciesIdx = otherSpecies[index].id;
            state.species[otherSpeciesIdx].critters = state.species[otherSpeciesIdx].critters.filter(el => !o.includes(el));
            state.species[idx].critters = t.critters.map((el) => {
              if (currentSpeciesCollisionCritters.includes(el)) {
                el.speed *= globals.speedChangeInConflict;
              }
              return el;
            });
          }

          // Draw a collision circle
          const collisionCircle = new Path2D();
          collisionCircle.arc(
            c.position.x,
            c.position.y,
            5,
            0,
            2 * Math.PI,
          );
          globals.ctx.fillStyle = 'rgba(255,255,255,0.6)';
          globals.ctx.fill(collisionCircle);
        }
      });
    });
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
