/* eslint-disable import/extensions */
import { state } from './state.js';
import { detectCollisions } from './physics.js';
import Species from './species.js';
import { uuid } from './uuid.js';

// TODO: Collision behaviour
// TODO: Better layouts (e.g. hex, pentagon, circle, square, random etc.)
// Game start / end
// Inputting of parameters

// Globals
const canvas = document.getElementById('canvas');
const globals = {
  numberOfSpecies: 2,
  debug: false,
  collisionRadius: 30,
  rendering: true,
  canvas,
  ctx: canvas.getContext('2d'),
  canvasHeight: canvas.height,
  canvasWidth: canvas.width,
  canvasOffsetLeft: canvas.offsetLeft,
  canvasOffsetTop: canvas.offsetTop,
  totalSpeciesEnergy: 2000,
  overPopulationRadius: 5,
  overPopulationNumber: 50,
  winningTeam: -1,
  ageDecayConstant: 7500000,
  respawnConstant: 25000,
};


const generateTick = () => {
  setInterval(() => {
    document.dispatchEvent(new Event('tick'));
  }, 50);
};

const clearCanvas = () => {
  globals.ctx.clearRect(0, 0, canvas.width, canvas.height);
};

window.onkeypress = () => {
  globals.rendering = true;
};

const determineWinner = () => {
  const remainingTeams = state.species.filter(t => t.getScore() > 0);
  return (remainingTeams && remainingTeams.length) > 1 ? -1 : remainingTeams[0].id;
};


const drawScore = () => {
  state.species.forEach((s, idx) => {
    const scoreString = `${s.name}: ${Math.ceil(s.getScore())}`;
    globals.ctx.font = '14px Lato, sans-serif';
    globals.ctx.fillStyle = s.colour;
    globals.ctx.fillText(scoreString, globals.canvasWidth - 250, 20 + 20 * idx);
  });
};

const drawSpeciesParameters = () => {
  globals.ctx.font = '14px Lato, sans-serif';
  globals.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  const metricsOfInterest = [
    'name',
    'groupSize',
    'critterSpeed',
    'critterSize',
    'critterSpacing',
    'respawnRate',
    'scaredRadius',
    'safetyRadius',
    'calmSafetyNumber',
    'scaredSafetyNumber',
    'maxAge',
  ];
  state.species.forEach((t, idx) => {
    let metricsDrawn = 0;
    Object.entries(t).forEach((e) => {
      if (metricsOfInterest.includes(e[0])) {
        globals.ctx.fillText(
          e.join(': '),
          0,
          14 + 175 * idx + 14 * metricsDrawn,
        );
        metricsDrawn += 1;
      }
    });
  });
};

const handleTick = () => {
  if (state.species.length >= globals.numberOfSpecies) {
    if (globals.rendering) {
      clearCanvas();
      state.species.forEach((s) => {
        s.critters.forEach((c) => {
          c.move();
          c.draw();
        });
        detectCollisions();
        s.respawnCritters();
        s.ageCritters();
        s.killOldCritters();
        s.killOverpopulatedCritters();
        s.calmCritters();
        s.normaliseCritterStats();
      });
      drawScore();
      if (globals.debug) {
        drawSpeciesParameters();
      }
      // globals.rendering = false;
      state.cycle += 1;
    }
  }
};


// Assume direction is a value between 0 and 2*PI
/*
                 pi/2
                  |
           1      |     3
                  |
 pi     ----------|---------- 0
                  |
            2     |     0
                  |
                3*pi/2

  */

const determineSpeciesDirections = () => {
  const speciesDirections = {};
  // Split the entire direction in to number of species fractions
  for (let i = 0; i < globals.numberOfSpecies; i += 1) {
    switch (i % 4) {
      case 0:
        speciesDirections[i] = 1.5 * Math.PI + 0.5 * Math.PI * Math.random();
        break;

      case 1:
        speciesDirections[i] = 0.5 * Math.PI + 0.5 * Math.PI * Math.random();
        break;

      case 2:
        speciesDirections[i] = 1 * Math.PI + Math.PI * Math.random();
        break;

      case 3:
        speciesDirections[i] = 0 * Math.PI + 0.5 * Math.PI * Math.random();
        break;

      default:
        break;
    }
  }
  return speciesDirections;
};

const degreesToRads = degrees => 2 * Math.PI * (degrees / 360);

/*
const validateControls = (controls) => {

};
*/


const disableControls = (controls) => {
  controls.forEach((f) => {
    const item = document.getElementById(f);
    item.disabled = true;
  });
};

const createTeam = () => {
  const directions = determineSpeciesDirections(globals.numberOfSpecies);
  const requiredFields = [
    'name',
    'colour',
    'groupSize',
    'scaredBehaviours',
    'respawnRate',
    'critterSpeed',
    'critterSize',
    'critterSpacing',
    'scaredRadius',
    'safetyRadius',
  ];
  const settingsObject = requiredFields.map((f) => {
    const item = document.getElementById(f);
    return { id: [item.id], value: item.value };
  });
  const settings = Object.assign(
    {},
    ...settingsObject.map((o) => {
      // TODO: add business logic to transform settings

      switch (o.id[0]) {
        case 'scaredBehaviours':
          switch (o.value) {
            case 'do_nothing':
              return { [o.id]: degreesToRads(0) };

            case 'go_backwards':
              return {
                [o.id]: degreesToRads(180),
              };
            case 'turn_left':
              return {
                [o.id]: degreesToRads(-90),
              };
            case 'turn_right':
              return {
                [o.id]: degreesToRads(90),
              };

            default:
              break;
          }
          break;

        case 'direction':
          return { [o.id]: directions[state.species.length] };
        case 'groupSize':
          return { [o.id]: +o.value };
        case 'respawnRate':
          return { [o.id]: +o.value / 100 };
        case 'critterSpeed':
          return { [o.id]: +o.value };
        case 'critterSize':
          return { [o.id]: +o.value };
        case 'critterSpacing':
          return { [o.id]: +o.value / 10 };
        case 'scaredRadius':
          return { [o.id]: +o.value };
        case 'safetyRadius':
          return { [o.id]: +o.value };

        default:
          return { [o.id]: o.value };
      }
    }),
  );
  const s = new Species(
    state.species.length, // id
    settings.name,
    settings.colour,
    settings.groupSize,
    state.directions[state.species.length], // manually set direction
    settings.scaredBehaviours,
    settings.respawnRate,
    settings.critterSpeed,
    settings.critterSize,
    settings.critterSpacing,
    settings.scaredRadius,
    settings.safetyRadius,
    Math.ceil(settings.groupSize * 0.15), // calmSafetyNumber
    Math.ceil(settings.groupSize * 0.25), // scaredSafetyNumber
    50000 + Math.ceil(Math.random() * 20000), // maxAge
  );
  // Add team
  state.species.push(s);
  // Clear fields
  requiredFields.forEach((f) => {
    const item = document.getElementById(f);
    item.value = item.id === 'colour' ? chroma.random().toString() : '';
  });
  if (state.species.length === globals.numberOfSpecies) {
    disableControls(requiredFields);
  }
};

const createRandomTeam = () => {
  const requiredFields = [
    'name',
    'colour',
    'groupSize',
    'scaredBehaviours',
    'respawnRate',
    'critterSpeed',
    'critterSize',
    'critterSpacing',
    'scaredRadius',
    'safetyRadius',
  ];
  const rand = Math.floor(4 * Math.random());
  requiredFields.forEach((f) => {
    const item = document.getElementById(f);
    switch (item.id) {
      case 'name':
        item.value = `Team ${state.species.length}`;
        break;
      case 'colour':
        item.value = chroma.random().saturate(1).brighten(1).toString();
        break;
      case 'groupSize':
        item.value = Math.ceil(50 * Math.random());
        break;

      case 'scaredBehaviours':
        switch (rand) {
          case 0:
            item.value = 'do_nothing';
            break;
          case 1:
            item.value = 'go_backwards';
            break;
          case 2:
            item.value = 'turn_left';
            break;
          case 3:
            item.value = 'turn_right';
            break;
          default:
            item.value = 'go_backwards';
            break;
        }
        break;

      case 'respawnRate':
        item.value = Math.ceil(100 * Math.random());
        break;

      case 'critterSpeed':
        item.value = Math.ceil(10 * Math.random());
        break;

      case 'critterSize':
        item.value = 1 + Math.ceil(2 * Math.random());
        break;

      case 'critterSpacing':
        item.value = Math.ceil(10 * Math.random());
        break;

      case 'scaredRadius':
        item.value = 20 + Math.ceil(20 * Math.random());
        break;

      case 'safetyRadius':
        item.value = 10 + Math.ceil(10 * Math.random());
        break;

      default:
        break;
    }
  });
};

document.onreadystatechange = async () => {
  state.directions = determineSpeciesDirections();
  document.getElementById('createBtn').addEventListener('click', () => {
    createTeam();
  });
  document.getElementById('randomiseBtn').addEventListener('click', () => {
    createRandomTeam();
  });
  // Create clock
  document.addEventListener('tick', handleTick, false);
  generateTick();
};

export { globals };
