import { resetState } from './state.js';
import {
  showGameOver,
  showCanvas,
  showMenu,
  showLevelSelect,
  handleTick,
} from './game.js';

let gameClock;
const fsm = StateMachine({
  init: 'configuring',
  transitions: [
    { name: 'levelSelect', from: 'configuring', to: 'levelSelect' },
    { name: 'start', from: 'levelSelect', to: 'playing' },
    { name: 'end', from: 'playing', to: 'end' },
    { name: 'restart', from: 'end', to: 'configuring' },
  ],
  methods: {
    onLevelSelect() {
      showLevelSelect();
    },
    onStart() {
      // Show Canvas
      showCanvas();
      // Start clock
      gameClock = setInterval(() => {
        document.dispatchEvent(new Event('tick'));
      }, 50);
      document.addEventListener('tick', handleTick);
    },
    onEnterEnd() {
      clearInterval(gameClock);
      showGameOver();
    },
    onRestart() {
      // Hide Menu
      resetState();
      showMenu();
    },
  },
});

export default fsm;
