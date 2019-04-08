import { uuid } from './uuid.js';
import { detectCollisions, determineNextCritterPosition } from './physics.js';
import { globals } from './main.js';

const critter = class {
  constructor() {
    this.id = uuid();
    const r = Math.random();
    this.team = {
      id: r > 0.5 ? 0 : 1,
      colour: r > 0.5 ? '#00FFFF' : '#0F0FFF', // "#" + (((1 << 24) * Math.random()) | 0).toString(16)
    };
    this.position = {
      x: Math.ceil(Math.random() * globals.canvas.width), // TODO: Use the global canvas?
      y: Math.ceil(Math.random() * globals.canvas.height),
    };
    this.speed = Math.ceil(Math.random() * 10);
    this.direction = Math.floor(Math.random() * 7); // N, NE, E, SE, S, SW, W, NW
    this.size = 2;
  }

  move() {
    this.position = determineNextCritterPosition(
      this.position.x,
      this.position.y,
      this.speed,
      this.direction,
    );
  }

  draw() {
    const circle = new Path2D();
    circle.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    globals.ctx.fillStyle = this.team.colour;
    globals.ctx.fill(circle);

    if (globals.collisionDebug) {
      const debugCircle = new Path2D();
      debugCircle.arc(this.position.x, this.position.y, this.size * 2, 0, 2 * Math.PI);
      globals.ctx.fillStyle = 'rgba(255,0,0,0.2)';
      globals.ctx.fill(debugCircle);
    }
  }
};

export { critter };
