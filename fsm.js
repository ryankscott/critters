import { globals } from './globals.js';
import { state, resetState } from './state.js';
import {
  changeGameOverVisibility,
  changeMenuVisibility,
  changeCanvasVisibility,
  handleTick,
  determineSpeciesDirections,
  showWinningText,
  hideWinningText,
} from './game.js';

let gameClock;
const fsm = StateMachine({
  init: 'configuring',
  transitions: [
    { name: 'start', from: 'configuring', to: 'playing' },
    { name: 'end', from: 'playing', to: 'end' },
    { name: 'restart', from: 'end', to: 'configuring' },
  ],
  methods: {
    onStart() {
    // Start clock
      gameClock = setInterval(() => {
        document.dispatchEvent(new Event('tick'));
      }, 50);
      document.addEventListener('tick', handleTick);

      // Hide Menu
      changeMenuVisibility(false);
      changeCanvasVisibility(true);
    },
    onEnd() {
      clearInterval(gameClock);
      //
      changeCanvasVisibility(false);
      changeGameOverVisibility(true);
      // Redraw who won
      showWinningText();
    },
    onRestart() {
      // Hide Menu
      changeMenuVisibility(true);
      changeCanvasVisibility(false);
      changeGameOverVisibility(false);
      hideWinningText();
      resetState();
    },
  },
});

export default fsm;
