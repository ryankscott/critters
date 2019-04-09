import { state } from './state.js';
import { critter } from './critters.js';
import { detectCollisions } from './physics.js';

// Globals
const canvas = document.getElementById('canvas');
const globals = {
  numberOfCritters: 200,
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

const handleTick = () => {
  if (globals.rendering) {
    clearCanvas();
    state.critters.forEach((c) => {
      c.move();
      c.draw();
      detectCollisions();
    });
    // globals.rendering = false;
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
    console.log(`Click at: ${x},${y}`);
    const clickedCritters = state.critters.filter(
      c => Math.ceil(c.position.x) > x - 5
        && Math.ceil(c.position.x) < x + 5
        && Math.ceil(c.position.y) > y - 5
        && Math.ceil(c.position.y) < y + 5,
    );
    console.log(clickedCritters.length);
    clickedCritters.map((c) => {
      console.log(`Critter in collision: ${JSON.stringify(c)}`);
      c.team.colour = '#00FF00';
      c.draw();
    });
  },
  false,
);

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    for (let index = 0; index < globals.numberOfCritters; index += 1) {
      state.critters.push(new critter());
    }

    // Create clock
    generateTick();
    document.addEventListener('tick', handleTick, false);
  }
};

export { globals };
