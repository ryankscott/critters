const globals = {
  numberOfSpecies: 2,
  debug: false,
  collisionRadius: 30,
  rendering: true,
  canvas: null,
  canvasHeight: 600,
  canvasWidth: 800,
  totalSpeciesEnergy: 500,
  energyChangeInConflict: 0.75,
  speedChangeInConflict: 0.9,
  speedChangeWhenScared: 1.05,
  speedNormalisationConstant: 1.01,
  energyNormalisationConstant: 1.001,
  directionNormalisationConstant: 1.001,
  mutationRate: 0.0005,
  respawnRateConstant: 25.0,
};

export { globals };
