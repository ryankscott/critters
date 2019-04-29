import { globals } from './globals.js';

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


const degreesToRads = degrees => 2 * Math.PI * (degrees / 360);

const clearCanvas = () => {
  globals.ctx.clearRect(0, 0, canvas.width, canvas.height);
};


export {
  colourCritters, degreesToRads, clearCanvas,
};
