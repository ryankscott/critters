import { globals } from './globals.js';
import { state } from './state.js';

const generateColours = (n) => {
  const s = chroma.scale('Spectral');
  return s.colors(n);
};

const generateRandomColour = () => {
// Get a list of the currently used colours (including the background)
  const colours = state.species.map(s => s.colour);
  colours.push(chroma('#000000'));

  // Find the average contrast between all colours
  const average = newColour => colours.reduce((p, c) => p + chroma.contrast(c, newColour), 0) / colours.length;

  let randomColour = chroma.random();
  // Keep generating colours until it's above threshold
  while (average(randomColour) < 7) {
    randomColour = chroma.random();
  }
  return randomColour;
};

const colourCritters = (critters, colour) => {
  critters.forEach((c) => {
    const cc = new Path2D();
    cc.arc(
      c.position.x,
      c.position.y,
      globals.collisionRadius,
      0,
      2 * Math.PI,
    );
    globals.ctx.fillStyle = colour;
    globals.ctx.fill(cc);
  });
};

const directionTowardsCritter = (c1, c2) => Math.atan((c2.position.y - c1.position.y) / (c2.position.x - c1.position.x));

const distanceBetweenCritters = (c1, c2) => Math.sqrt((c1.position.x - c2.position.x) ** 2 + (c1.position.y - c2.position.y) ** 2);

const degreesToRads = degrees => 2 * Math.PI * (degrees / 360);

const clearCanvas = () => {
  globals.ctx.clearRect(0, 0, globals.canvasWidth, globals.canvasHeight);
};


export {
  colourCritters,
  degreesToRads,
  clearCanvas,
  generateRandomColour,
  distanceBetweenCritters,
  directionTowardsCritter,
  generateColours,
};
