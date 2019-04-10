/* eslint-disable no-mixed-operators */
import { state } from './state.js';
import { globals } from './main.js';

const areCrittersNear = (a, b, radius) => {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < Math.floor(a.size) + Math.floor(b.size) + 2 * radius;
};

const determineCrittersInRadius = (initialCritter, critterList, radius, team = state.teams) => critterList.filter(c => areCrittersNear(initialCritter, c, radius) && team.includes(c.team.id));

const determineEnergyInCollision = (
  critterSize,
  critterSpeed,
  critterPosition,
  collisionPosition,
) => {
  // Assume that power decreases based on inverse square
  const distanceFromCollision = Math.sqrt(
    (collisionPosition.x - critterPosition.x) ** 2 + (collisionPosition.y - critterPosition.y) ** 2,
  );

  return (critterSize * critterSpeed) / distanceFromCollision ** 2;
};

const splitCrittersIntoTeams = (critters) => {
  const teams = {};
  critters.map((c) => {
    const t = c.team.id;
    t in teams ? teams[t].push(c) : (teams[t] = [c]);
  });
  return teams;
};

const detectCollisions = () => {
  // Start with one team
};
// Loop over all the critters in other teams
// Detect if there's a collision

// Move to the next team

//       // Don't match on the same critter
//       // Find all critters in the collision
//       const nearCritters = determineCrittersInARadius(state.critters[i], globals.collisionRadius);

//       // Split the nearby critters into teams
//       const teams = splitCrittersIntoTeams(nearCritters);

//       // Determine the total "energy" per team
//       let teamEnergies = Object.entries(teams).map((v, idx) => ({
//         team: v[0],
//         energy: v[1].reduce(
//           (acc, cv) => acc
//             + determineEnergyInCollision(
//               cv.size,
//               cv.speed,
//               cv.position,
//               state.critters[i].position,
//             ),
//           0,
//         ),
//       }));
//       teamEnergies = teamEnergies.sort((a, b) => a.energy < b.energy);

// for (let i = 0; i < state.critters.length; i += 1) {
//   for (let j = i + 1; j < state.critters.length; j += 1) {
//     // If we're near a collision
//     if (areCrittersNear(state.critters[i], state.critters[j], 10)) {
//       const nearCritters = determineCrittersInARadius(state.critters[i], 20);
//       const teams = splitCrittersIntoTeams(nearCritters);
//       // Determine the total "energy" per team
//       let teamEnergies = Object.entries(teams).map((v, idx) => ({
//         team: v[0],
//         energy: v[1].reduce((acc, cv) => acc + cv.size * cv.speed, 0),
//       }));

//       teamEnergies = teamEnergies.sort((a, b) => a.energy < b.energy);
//       if (teamEnergies.length > 1) {
//         const losingTeam = teamEnergies[1].team;
//         state.critters.map((c) => {
//           if (nearCritters.includes(c) && c.team.id == losingTeam.id) {
//             debugger;
//             const currentDirection = c.direction;
//             c.direction = c.collisionDirection;
//             c.collisionDirection = currentDirection;
//           }
//         });
//       }
//     }

//     if (areCrittersNear(state.critters[i], state.critters[j], 0)) {
//       // Don't match on the same critter
//       // Find all critters in the collision
//       const nearCritters = determineCrittersInARadius(state.critters[i], globals.collisionRadius);

//       // Split the nearby critters into teams
//       const teams = splitCrittersIntoTeams(nearCritters);

//       // Determine the total "energy" per team
//       let teamEnergies = Object.entries(teams).map((v, idx) => ({
//         team: v[0],
//         energy: v[1].reduce(
//           (acc, cv) => acc
//             + determineEnergyInCollision(
//               cv.size,
//               cv.speed,
//               cv.position,
//               state.critters[i].position,
//             ),
//           0,
//         ),
//       }));
//       teamEnergies = teamEnergies.sort((a, b) => a.energy < b.energy);

//       // Remove all critters from the "losing team"
//       // TODO: support multiple team collisions
//       if (teamEnergies.length > 1) {
//         // Debug
//         if (globals.collisionDebug) {
//           const debugCircle = new Path2D();
//           debugCircle.arc(
//             state.critters[i].position.x,
//             state.critters[i].position.y,
//             10,
//             0,
//             2 * Math.PI,
//           );
//           globals.ctx.fillStyle = 'rgba(255,255,255,0.6)';
//           globals.ctx.fill(debugCircle);
//         }
//         const losingTeam = teamEnergies[1].team;
//         const deadCritters = nearCritters.filter(c => c.team.id == losingTeam);
//         const existingCritters = state.critters.filter(c => !deadCritters.includes(c));
//         state.critters = existingCritters;
//       }

// TODO: Change the direction of the "winning team"
// }

//
//    }
//  }
// };

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
  switch (true) {
    case direction < Math.PI / 2:
      return normalisePositionToCanvas(
        xPos - speed * Math.cos(direction),
        yPos + speed * Math.sin(direction),
      );
    case direction > Math.PI / 2 && direction < Math.PI:
      return normalisePositionToCanvas(
        xPos + speed * Math.cos(direction),
        yPos - speed * Math.sin(direction),
      );
    case direction > Math.PI && direction < (3 * Math.PI) / 2:
      return normalisePositionToCanvas(
        xPos - speed * Math.cos(direction),
        yPos + speed * Math.sin(direction),
      );
    case direction > (3 * Math.PI) / 2 && direction < 2 * Math.PI:
      return normalisePositionToCanvas(
        xPos + speed * Math.cos(direction),
        yPos - speed * Math.sin(direction),
      );
    default:
      return normalisePositionToCanvas(
        xPos + speed * Math.cos(direction),
        yPos - speed * Math.sin(direction),
      );
  }
};

export { detectCollisions, determineNextCritterPosition };
