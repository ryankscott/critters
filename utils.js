import { globals } from './main.js';

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


export { colourCritters };
