import { uuid } from "./uuid.js";
import { detectCollisions, determineNextCritterPosition } from "./physics.js";
import { globals } from "./main.js";

const critter = class {
  constructor(team, position, direction, conflictDirection, speed, size) {
    this.id = uuid();
    this.team = team;
    this.position = position;
    this.direction = direction;
    this.conflictDirection = conflictDirection;
    this.speed = speed;
    this.size = size;
  }

  move() {
    this.position = determineNextCritterPosition(
      this.position.x,
      this.position.y,
      this.speed,
      this.direction
    );
  }

  draw() {
    const circle = new Path2D();
    circle.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    globals.ctx.fillStyle = this.team.colour;
    globals.ctx.fill(circle);
  }
};

export { critter };
