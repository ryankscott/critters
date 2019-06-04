import { globals } from './globals.js';
import { state } from './state.js';
import Species from './species.js';
import { clearCanvas, generateRandomColour } from './utils.js';
import { detectCollisions } from './physics.js';
import fsm from './fsm.js';
import { levels } from './levels.js';
import { generateColours } from './utils.js';
import {
  canvasText,
  menuText,
  gameOverText,
  levelSelectText,
} from './templates.js';

const getNextTeamID = () => state.species.length;

const showGameOver = () => {
  const contentDiv = document.getElementById('content');
  if (state.winningTeam === 0) {
    contentDiv.innerHTML = gameOverText('won', state.cycle / 20);
  } else {
    contentDiv.innerHTML = gameOverText('lost', state.cycle / 20);
  }
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    fsm.restart();
  });
};

const showCanvas = () => {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = canvasText(globals.canvasWidth, globals.canvasHeight);
  const canvas = document.getElementById('canvas');
  globals.canvas = canvas;
  globals.ctx = canvas.getContext('2d');
};

const showMenu = () => {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = menuText();
  document.getElementById('randomiseBtn').addEventListener('click', () => {
    createRandomTeam();
  });
  document.getElementById('selectLevelBtn').addEventListener('click', () => {
    state.colours = generateColours(2); // TODO: Move me
    createTeam();
    fsm.levelSelect();
  });
};

const showLevelSelect = () => {
  const contentDiv = document.getElementById('content');
  contentDiv.innerHTML = levelSelectText();
  const levelWrappers = document.getElementsByClassName('levelWrapper');
  for (let l of levelWrappers) {
    l.addEventListener(
      'click',
      (e) => {
        // TODO: Extract this to a function
        let wrapperDiv;
        if (l !== e.target) {
          wrapperDiv = e.target.parentElement;
        } else {
          wrapperDiv = e.target;
        }
        const levelID = wrapperDiv.id;
        // Add level one species
        if (state.species.length == 2) {
          state.species[1] = levels[levelID];
        } else {
          state.species.push(levels[levelID]);
        }
        state.species[1].generateCritters();
        // Add selected class to that one clicked
        const wrappers = document.getElementsByClassName('levelWrapper');
        for (let w of wrappers) {
          w.classList.remove('selected');
        }
        wrapperDiv.classList.add('selected');
      },
      true,
    );
  }
  const play = document.getElementById('playBtn');
  play.addEventListener('click', () => {
    if (state.species.length == 2) {
      fsm.start();
      return;
    }
    return;
  });
};

const drawScore = () => {
  state.species.forEach((s, idx) => {
    const scoreString = `${s.name} - Critters: ${s.critters.length}`;
    globals.ctx.font = '8px dos437_web, sans-serif';
    globals.ctx.fillStyle = s.colour;
    globals.ctx.fillText(scoreString, globals.canvasWidth - 200, 20 + 20 * idx);
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
    // TODO: Work out why this seems to iterate back over to name again
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
        case 'groupSize':
          return { [o.id]: +o.value };
        case 'energyUsage':
          return {
            respawnRate: 1 - +o.value / 10.0,
            critterEnergy: +o.value / 10.0,
          };
        case 'critterSize':
          return {
            critterSpeed: +o.value / 10.0,
            critterSize: 1 - +o.value / 10.0,
          };
        case 'critterSpacing':
          return { [o.id]: +o.value / 10.0 };
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
    'square_filled', // TODO: Add this as an option
    1.5 * Math.PI + 0.25 * Math.PI + 0.25 * Math.PI * (Math.random() - 0.5),
    settings.scaredBehaviours,
    settings.respawnRate * 2,
    settings.critterSpeed * 10,
    settings.critterSize * 2 + 1.0,
    settings.critterSpacing * 10 + 2.0,
    globals.totalSpeciesEnergy,
    settings.critterEnergy * 20,
    settings.scaredRadius,
    settings.safetyRadius,
    Math.ceil(settings.groupSize * 0.15), // calmSafetyNumber
    Math.ceil(settings.groupSize * 0.25), // scaredSafetyNumber
  );
  // Add team
  s.generateCritters();
  state.species.push(s);

  // Clear fields
  requiredFields.forEach((f) => {
    const item = document.getElementById(f);
    item.value = item.id === 'colour' ? generateRandomColour() : '';
  });
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
  // Someone loses if their score is 0
  const remainingTeams = state.species.filter((t) => t.getScore() > 0);
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
  showMenu,
  showLevelSelect,
  showCanvas,
  showGameOver,
  handleTick,
  getNextTeamID,
};
