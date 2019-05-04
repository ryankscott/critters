
const canvas = document.getElementById('canvas');
const globals = {
  numberOfSpecies: 2,
  debug: false,
  collisionRadius: 30,
  rendering: true,
  canvas,
  ctx: canvas.getContext('2d'),
  canvasHeight: canvas.height,
  canvasWidth: canvas.width,
  canvasOffsetLeft: canvas.offsetLeft,
  canvasOffsetTop: canvas.offsetTop,
  totalSpeciesEnergy: 500,
  energyChangeInConflict: 0.75,
  speedChangeInConflict: 0.90,
  speedChangeWhenScared: 1.05,
  speedNormalisationConstant: 1.01,
  energyNormalisationConstant: 1.001,
  mutationRate: 0.001,
  respawnRateConstant: 25.0,
};

export { globals };
