import { globals } from './globals.js';
import { state } from './state.js';
import Species from './species.js';
import {
  clearCanvas,
  generateRandomColour,
} from './utils.js';
import { detectCollisions } from './physics.js';
import fsm from './fsm.js';
import { zergs } from './levels.js';

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

const determineSpeciesDirections = () => [1.5 * Math.PI + 0.25 * Math.PI + (0.25 * Math.PI * (Math.random() - 0.5)),
  0.5 * Math.PI + 0.25 * Math.PI + (0.250 * Math.PI * (Math.random() - 0.5))];

const getNextTeamID = () => state.species.length;


const hideWinningText = () => {
  const youWon = document.getElementById('youWon');
  const youLost = document.getElementById('youLost');
  youWon.classList.add('hidden');
  youLost.classList.add('hidden');
};

const showWinningText = () => {
  const youWon = document.getElementById('youWon');
  const youLost = document.getElementById('youLost');
  const survivalText = document.getElementById('survivalTime');
  if (state.winningTeam === 0) {
    youWon.classList.remove('hidden');
    survivalText.innerHTML = `You won in ${state.cycle / 20} seconds`;
  } else {
    youLost.classList.remove('hidden');
    survivalText.innerHTML = `You survived for ${state.cycle / 20} seconds`;
  }
};

const changeGameOverVisibility = (show) => {
  const gameOver = document.getElementById('gameOver');
  show ? gameOver.classList.remove('hidden') : gameOver.classList.add('hidden');
};

const changeCanvasVisibility = (show) => {
  const canvas = document.getElementById('canvasDiv');
  show ? canvas.classList.remove('hidden') : canvas.classList.add('hidden');
};

const changeMenuVisibility = (show) => {
  const menu = document.getElementById('menu');
  show ? menu.classList.remove('hidden') : menu.classList.add('hidden');
};

const drawScore = () => {
  state.species.forEach((s, idx) => {
    const scoreString = `${s.name} - Critters: ${
      s.critters.length
    }, Energy:  ${Math.ceil(s.getScore())}`;
    globals.ctx.font = '14px Lato, sans-serif';
    globals.ctx.fillStyle = s.colour;
    globals.ctx.fillText(scoreString, globals.canvasWidth - 300, 20 + 20 * idx);
  });
};

const createTeam = () => {
  const requiredFields = [
    'name',
    'colour',
    'groupSize',
    'scaredBehaviours',
    'energyUsage',
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
          return { [o.id]: o.value };
        case 'direction':
          return { [o.id]: this.state.directions[state.species.length] };
        case 'groupSize':
          return { [o.id]: +o.value };
        case 'energyUsage':
          return {
            respawnRate: 1 - (+o.value / 10.0),
            critterEnergy: +o.value / 10.0,
          };
        case 'critterSize':
          return {
            critterSpeed: (+o.value / 10.0),
            critterSize: 1 - (+o.value / 10.0),
          };
        case 'critterSpacing':
          return { [o.id]: (+o.value / 10.0) };
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
    getNextTeamID(),
    settings.name,
    settings.colour,
    settings.groupSize,
    'spiral',
    state.directions[state.species.length], // manually set direction
    settings.scaredBehaviours,
    settings.respawnRate * 2,
    settings.critterSpeed * 10,
    settings.critterSize * 2 + 1.0,
    settings.critterSpacing * 10 + 2.0,
    settings.critterEnergy * 20,
    settings.scaredRadius,
    settings.safetyRadius,
    Math.ceil(settings.groupSize * 0.15), // calmSafetyNumber
    Math.ceil(settings.groupSize * 0.25), // scaredSafetyNumber
  );
  // Add team
  state.species.push(s);

  // Add level one species
  switch (state.level) {
    case 1:
      state.species.push(zergs(getNextTeamID()));
      break;

    default:
      state.species.push(zergs);
      break;
  }

  // Clear fields
  requiredFields.forEach((f) => {
    const item = document.getElementById(f);
    item.value = item.id === 'colour' ? generateRandomColour() : '';
  });

  if (state.species.length === globals.numberOfSpecies) {
    fsm.start();
  }
};

const createRandomTeam = () => {
  const requiredFields = [
    'name',
    'colour',
    'groupSize',
    'scaredBehaviours',
    'energyUsage',
    'critterSize',
    'critterSpacing',
    'scaredRadius',
    'safetyRadius',
  ];
  const numberOfBehavours = document.getElementById('scaredBehaviours').length;
  const randBehaviour = Math.floor(numberOfBehavours * Math.random());
  requiredFields.forEach((f) => {
    const item = document.getElementById(f);
    switch (item.id) {
      case 'name':
        item.value = `Team ${state.species.length}`;
        break;
      case 'colour':
        item.value = generateRandomColour().toString();
        break;
      case 'groupSize':
        item.value = Math.ceil(100 * Math.random());
        break;

      case 'scaredBehaviours':
        switch (randBehaviour) {
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
          case 4:
            item.value = 'random';
            break;
          case 5:
            item.value = 'nearest_neighbour';
            break;
          default:
            item.value = 'go_backwards';
            break;
        }
        break;

      case 'energyUsage':
        item.value = Math.ceil(5 * Math.random());
        break;

      case 'critterSize':
        item.value = Math.ceil(5 * Math.random());
        break;

      case 'critterSpacing':
        item.value = Math.ceil(10 * Math.random());
        break;

      case 'scaredRadius':
        item.value = Math.ceil(100 * Math.random());
        break;

      case 'safetyRadius':
        item.value = Math.ceil(100 * Math.random());
        break;

      default:
        break;
    }
  });
};

const determineWinner = () => {
  const remainingTeams = state.species.filter(t => t.getScore() > 0);
  return (remainingTeams && remainingTeams.length) > 1
    ? -1
    : remainingTeams[0].id;
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
  const hasSomeoneWon = determineWinner();
  if (hasSomeoneWon >= 0) {
    state.winningTeam = hasSomeoneWon;
    fsm.end();
    return;
  }
  clearCanvas();
  state.species.forEach((s) => {
    s.critters.forEach((c) => {
      c.move();
      c.draw();
      c.normalise();
      c.calm();
    });
    detectCollisions();
    s.respawnCritters();
  });
  drawScore();
  if (globals.debug) {
    drawSpeciesParameters();
  }
  state.cycle += 1;
};

export {
  createTeam,
  createRandomTeam,
  changeGameOverVisibility,
  changeMenuVisibility,
  changeCanvasVisibility,
  showWinningText,
  hideWinningText,
  handleTick,
  determineSpeciesDirections,
  getNextTeamID,
};
