/* eslint-disable import/extensions */
import { state } from './state.js';
import { detectCollisions } from './physics.js';
import Team from './team.js';

// TODO: Collision behaviour
// TODO: Better layouts (e.g. hex, pentagon, circle, square, random etc.)
// Respawn
// Game start / end
// Inputting of parameters

// Globals
const canvas = document.getElementById('canvas');
const globals = {
  numberOfTeams: 2,
  collisionDebug: true,
  collisionRadius: 5,
  rendering: true,
  canvas,
  ctx: canvas.getContext('2d'),
  canvasHeight: canvas.height,
  canvasWidth: canvas.width,
  canvasOffsetLeft: canvas.offsetLeft,
  canvasOffsetTop: canvas.offsetTop,
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

const drawScore = () => {
  const teamEnergies = {};
  Object.keys(state.critters).forEach((key) => {
    teamEnergies[key] = state.critters[key].reduce(
      (acc, cv) => acc + cv.size * cv.speed,
      0,
    );
  });
  const scores = [];
  for (let i = 0; i < globals.numberOfTeams; i += 1) {
    scores.push(`Team ${i}:   ${teamEnergies[i]}`);
  }
  globals.ctx.font = '14px sans-serif';
  globals.ctx.fillStyle = '#FFFFFF';
  scores.forEach((s, idx) => {
    globals.ctx.fillText(s, globals.canvasWidth - 100, 20 + 20 * idx);
  });
};

const handleTick = () => {
  if (globals.rendering) {
    clearCanvas();
    Object.values(state.critters).forEach((v) => {
      v.forEach((c) => {
        c.move();
        c.draw();
        detectCollisions();
      });
    });

    drawScore();
    globals.rendering = false;
    state.cycle += 1;
    state.critterDistances = [];
  }
};


// Debug handling
canvas.addEventListener(
  'click',
  (e) => {
    const x = e.pageX - globals.canvasOffsetLeft;
    const y = e.pageY - globals.canvasOffsetTop;
    const allCritters = Object.values(state.critters).flat();
    const clickedCritters = allCritters.filter(
      c => Math.ceil(c.position.x) > x - 5
        && Math.ceil(c.position.x) < x + 5
        && Math.ceil(c.position.y) > y - 5
        && Math.ceil(c.position.y) < y + 5,
    );
    clickedCritters.forEach((c) => {
      // eslint-disable-next-line no-param-reassign
      c.team.colour = '#00FF00';
      c.draw();
    });
  },
  false,
);

const colours = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00'];

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

const determineTeamDirections = (numberOfTeams) => {
  const teamDirections = {};
  // Split the entire direction in to number of teams fractions
  for (let i = 0; i < numberOfTeams; i += 1) {
    switch (i % 4) {
      case 0:
        teamDirections[i] = 1.5 * Math.PI + 0.5 * Math.PI * Math.random();
        break;

      case 1:
        teamDirections[i] = 0.5 * Math.PI + 0.5 * Math.PI * Math.random();
        break;

      case 2:
        teamDirections[i] = 1 * Math.PI + Math.PI * Math.random();
        break;

      case 3:
        teamDirections[i] = 0 * Math.PI + 0.5 * Math.PI * Math.random();
        break;

      default:
        break;
    }
  }
  return teamDirections;
};

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    const teamDirection = determineTeamDirections(globals.numberOfTeams);
    for (let i = 0; i < globals.numberOfTeams; i += 1) {
      state.critters[i] = []; // TODO: Fix this
      const t = new Team(
        i, // id
        colours[i], // colour
        Math.ceil(10 * Math.random()), // group size
        teamDirection[i], // team direction
        teamDirection[i] - Math.PI * Math.random(), // conflict direction
        Math.random(), // aggression
        Math.random(), // respawn
        2 + Math.ceil(10 * Math.random()), // critter speed
        Math.ceil(2 * Math.random()), // critter size
        Math.random(), // critter spacing
      );
      t.generateCritters();
      state.teams.push(t);
    }
    // Create clock
    generateTick();
    document.addEventListener('tick', handleTick, false);
  }
};

export { globals };
