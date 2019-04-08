/* eslint-disable no-mixed-operators */
import { state } from './state.js';
import { globals } from './main.js';

const isCollision = (a, b) => {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < Math.floor(a.size) + Math.floor(b.size);
};

const detectCollisions = () => {
  for (let i = 0; i < state.critters.length; i += 1) {
    for (let j = i + 1; j < state.critters.length; j += 1) {
      if (isCollision(state.critters[i], state.critters[j])) {
        // state.critters[i].team.colour = '#FF0000';
        // state.critters[j].team.colour = '#FF0000';

        // TODO: Work out who dies
        const nearCritters = state.critters.filter((c) => {
          const xPos = c.position.x;
          const yPos = c.position.y;
          return (
            Math.abs(xPos - state.critters[i].position.x) <= 5
            && Math.abs(yPos - state.critters[i].position.y) <= 5
          );
        });

        // Split the nearby critters into teams
        const teams = {};
        nearCritters.map((c) => {
          const t = c.team.id;
          t in teams ? teams[t].push(c) : (teams[t] = [c]);
        });

        // Determine the total "energy"
        // TODO: This should really factor in the collision direction?
        let teamEnergies = Object.entries(teams).map((v, idx) => ({
          team: v[0],
          energy: v[1].reduce((acc, cv) => acc + cv.size * cv.speed, 0),
        }));
        teamEnergies = teamEnergies.sort((a, b) => a.energy < b.energy);

        // Remove all critters from the "losing team"
        // TODO: support multiple teams
        if (teamEnergies.length > 1) {
          console.log(`Team energies: ${JSON.stringify(teamEnergies)}`);
          const losingTeam = teamEnergies[1].team;
          console.log(`Losing team: ${losingTeam}`);
          const deadCritters = nearCritters.filter(c => (c.team.id = losingTeam));
          console.log(`Dead critters:${JSON.stringify(deadCritters.map(c => c.team.id))}`);
          const existingCritters = state.critters.filter(c => !deadCritters.includes(c));
          state.critters = existingCritters;
        }
      }

      //
    }
  }
};

const determineNextCritterPosition = (xPos, yPos, speed, direction) => {
  const { canvasHeight, canvasWidth } = globals;
  switch (direction) {
    case 0: // N
      return {
        x: xPos,
        y: yPos - speed < 0 ? canvasHeight : yPos - speed,
      };

      /*
                         /|
                     c  / | a
                       /  |
                      -----
                        b
                        c = 10
                        c^2 = b^2 + a^2 (if a == b)
                        c^2 = 2a^2
                        0.5(c^2) = a^2
                        a = sqrt(0.5*(c^2))
                      */

    case 1: // NE
      return {
        x: xPos + Math.sqrt(0.5 * speed ** 2) ? canvasWidth : xPos + Math.sqrt(0.5 * speed ** 2),
        y:
          yPos - Math.sqrt(0.5 * speed ** 2) < 0
            ? canvasHeight
            : yPos - Math.sqrt(0.5 * speed ** 2),
      };

    case 2: // E
      return {
        x: xPos + speed > canvasWidth ? 0 : xPos + speed,
        y: yPos,
      };

    case 3: // SE
      return {
        x:
          xPos + Math.sqrt(0.5 * speed ** 2) > canvasWidth ? 0 : xPos + Math.sqrt(0.5 * speed ** 2),
        y:
          yPos + Math.sqrt(0.5 * speed ** 2) > canvasHeight
            ? 0
            : yPos + Math.sqrt(0.5 * speed ** 2),
      };

    case 4: // S
      return {
        x: xPos,
        y: yPos + speed > canvasHeight ? 0 : yPos + speed,
      };

    case 5: // SW
      return {
        x: xPos - Math.sqrt(0.5 * speed ** 2) < 0 ? canvasWidth : Math.sqrt(0.5 * speed ** 2),
        y:
          yPos + Math.sqrt(0.5 * speed ** 2) > canvasHeight
            ? 0
            : yPos + Math.sqrt(0.5 * speed ** 2),
      };

    case 6: // W
      return {
        x: xPos - speed < 0 ? canvasWidth : xPos - speed,
        y: yPos,
      };

    case 7: // NW
      return {
        x:
          xPos - Math.sqrt(0.5 * speed ** 2) < 0 ? canvasWidth : xPos - Math.sqrt(0.5 * speed ** 2),
        y:
          yPos - Math.sqrt(0.5 * speed ** 2) < 0
            ? canvasHeight
            : yPos - Math.sqrt(0.5 * speed ** 2),
      };

    default:
      return { x: xPos, y: yPos };
  }
};

export { detectCollisions, determineNextCritterPosition };
