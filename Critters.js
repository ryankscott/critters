/* eslint-disable no-bitwise */
// Globals
const maxWidth = 800;
const maxHeight = 600;
const numberOfCritters = 200;
const collisionDebug = true;
let rendering = true;

const uuid = () => {
  let dt = new Date().getTime();
  const u = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
  return u;
};

// TODO: change to trig functions if we want more directions
const determineNextCritterPosition = critter => {
  switch (critter.direction) {
    case 0: // N
      return {
        x: critter.position.x,
        y:
          critter.position.y - critter.speed < 0
            ? maxHeight
            : critter.position.y - critter.speed
      };

    /*
                         /|
                     c  / | a
                       /  |
                      -----
                        b
                        c = 10
                        c^2 = b^2 + a^2 (if a == b)
                        c^2 = 2a^2
                        0.5(c^2) = a^2
                        a = sqrt(0.5*(c^2))
                      */

    case 1: // NE
      return {
        x:
          critter.position.x + Math.sqrt(0.5 * critter.speed ** 2) > maxWidth
            ? maxWidth
            : critter.position.x + Math.sqrt(0.5 * critter.speed ** 2),
        y:
          critter.position.y - Math.sqrt(0.5 * critter.speed ** 2) < 0
            ? maxHeight
            : critter.position.y - Math.sqrt(0.5 * critter.speed ** 2)
      };

    case 2: // E
      return {
        x:
          critter.position.x + critter.speed > maxWidth
            ? 0
            : critter.position.x + critter.speed,
        y: critter.position.y
      };

    case 3: // SE
      return {
        x:
          critter.position.x + Math.sqrt(0.5 * critter.speed ** 2) > maxWidth
            ? 0
            : critter.position.x + Math.sqrt(0.5 * critter.speed ** 2),
        y:
          critter.position.y + Math.sqrt(0.5 * critter.speed ** 2) > maxHeight
            ? 0
            : critter.position.y + Math.sqrt(0.5 * critter.speed ** 2)
      };

    case 4: // S
      return {
        x: critter.position.x,
        y:
          critter.position.y + critter.speed > maxHeight
            ? 0
            : critter.position.y + critter.speed
      };

    case 5: // SW
      return {
        x:
          critter.position.x - Math.sqrt(0.5 * critter.speed ** 2) < 0
            ? maxWidth
            : Math.sqrt(0.5 * critter.speed ** 2),
        y:
          critter.position.y + Math.sqrt(0.5 * critter.speed ** 2) > maxHeight
            ? 0
            : critter.position.y + Math.sqrt(0.5 * critter.speed ** 2)
      };

    case 6: // W
      return {
        x:
          critter.position.x - critter.speed < 0
            ? maxWidth
            : critter.position.x - critter.speed,
        y: critter.position.y
      };

    case 7: // NW
      return {
        x:
          critter.position.x - Math.sqrt(0.5 * critter.speed ** 2) < 0
            ? maxWidth
            : critter.position.x - Math.sqrt(0.5 * critter.speed ** 2),
        y:
          critter.position.y - Math.sqrt(0.5 * critter.speed ** 2) < 0
            ? maxHeight
            : critter.position.y - Math.sqrt(0.5 * critter.speed ** 2)
      };

    default:
      return { x: critter.position.x, y: critter.position.y };
  }
};

const Critter = class {
  constructor() {
    this.id = uuid();
    this.team = {
      id: 1,
      colour: "#00FFFF" // "#" + (((1 << 24) * Math.random()) | 0).toString(16)
    };
    this.position = {
      x: Math.ceil(Math.random() * maxWidth),
      y: Math.ceil(Math.random() * maxHeight)
    };
    this.speed = Math.ceil(Math.random() * 10);
    this.direction = Math.floor(Math.random() * 7); // N, NE, E, SE, S, SW, W, NW
    this.size = 2;
  }

  move() {
    this.position = determineNextCritterPosition(this);
  }

  draw() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const circle = new Path2D();
    circle.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    ctx.fillStyle = this.team.colour;
    ctx.fill(circle);

    if (collisionDebug) {
      const debugCircle = new Path2D();
      debugCircle.arc(
        this.position.x,
        this.position.y,
        this.size * 2,
        0,
        2 * Math.PI
      );
      ctx.fillStyle = "rgba(255,0,0,0.2)";
      ctx.fill(debugCircle);
    }
  }
};

const state = {
  cycle: 0,
  critters: [],
  critterDistances: []
};

const generateTick = () => {
  setInterval(() => {
    document.dispatchEvent(new Event("tick"));
  }, 50);
};

const clearCanvas = () => {
  const canvas = document.getElementById("canvas");
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
};

const isCollision = (a, b) => {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  /*state.critterDistances.push({
    id1: a.id,
    id2: b.id,
    distance
  });*/
  return distance < Math.floor(a.size) + Math.floor(b.size);
};

const detectCollisions = () => {
  for (let i = 0; i < state.critters.length; i += 1) {
    for (let j = i + 1; j < state.critters.length; j += 1) {
      if (isCollision(state.critters[i], state.critters[j])) {
        state.critters[i].team.colour = "#FF0000";
        state.critters[j].team.colour = "#FF0000";
        // TODO: Work out who dies
      }
    }
  }
};

window.onkeypress = () => {
  rendering = true;
};

const handleTick = () => {
  if (rendering) {
    clearCanvas();
    state.critters.forEach(c => {
      detectCollisions();
      c.move();
      c.draw();
    });
    rendering = true; // false
    state.cycle += 1;
    state.critterDistances = [];
  }
};

document.onreadystatechange = () => {
  if (document.readyState === "interactive") {
    for (let index = 0; index < numberOfCritters; index += 1) {
      state.critters.push(new Critter());
    }

    // Create clock
    generateTick();
    document.addEventListener("tick", handleTick, false);
  }
};
