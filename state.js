// TODO: This is gross

const state = {
  cycle: 0,
  species: [],
  critters: [],
  directions: [],
  winningTeam: -1,
};

const resetState = () => {
  state.cycle = 0;
  state.species = [];
  state.critters = [];
  state.directions = [];
  state.winningTeam = -1;
};

export { state, resetState };
