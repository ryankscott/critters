import { levels } from './levels.js';

const canvasText = (width, height) => `
      <div class="canvasDiv" id="canvasDiv">
        <canvas id="canvas" class="canvas" height="${height}" width="${width}"> </canvas>
      </div>
`;

const menuText = () => `
      <div id="menu" class="menu">
        <h3>Create your species:</h3>
        <div class="menuRowTitleContainer">
          <p class="menuRowTitle">Species attributes</p>
        </div>
        <div class="menuRow">
          <div class="menuCol">
            <label for="name">Name:</label>
            <input type="text" id="name" required/>
          </div>
          <div class="menuCol">
            <label for="colour">Colour:</label>
            <input
              type="color"
              id="colour"
              value="chroma.random().toString()"
              name="color"
              required
              width="20"
            />
          </div>
        </div>
        <div class="menuRowTitleContainer">
          <p class="menuRowTitle">Critter attributes</p>
        </div>
        <div class="menuRow">
          <div class="menuCol">
            <label for="groupSize">Group Size:</label>
            <input
              type="range"
              id="groupSize"
              name="groupSize"
              required
              min="1"
              max="100"
              step="1"
            />
            <div class="inputRange">
              <p class="inputRangeText">Small</p>
              <p class="inputRangeText">Large</p>
            </div>
            <label for="scaredBehaviour">Scared behaviour:</label>

            <select id="scaredBehaviours">
              <option value="do_nothing">Do nothing</option>
              <option value="go_backwards">Go backwards</option>
              <option value="turn_left">Turn left</option>
              <option value="turn_right">Turn right</option>
              <option value="alternate">Alternate</option>
              <option value="random">Random</option>
              <option value="nearest_neighbour">Nearest Neighbour</option>
              <option value="towards_pack">Towards Pack</option>
            </select>

            <label for="critterSpacing">Spacing:</label>
            <input
              type="range"
              id="critterSpacing"
              name="critterSpacing"
              required
              min="1"
              max="10"
              step="1"
            />
            <div class="inputRange">
              <p class="inputRangeText">Close</p>
              <p class="inputRangeText">Spaced</p>
            </div>
          </div>
          <div class="menuCol">
            <label for="energyUsage">Energy Usage:</label>
            <input
              type="range"
              id="energyUsage"
              name="energyUsage"
              required
              min="1"
              max="5"
              step="1"
            />
            <div class="inputRange">
              <p class="inputRangeText">Fighting</p>
              <p class="inputRangeText">Respawning</p>
            </div>
            <label for="critterSize">Size:</label>
            <input
              type="range"
              id="critterSize"
              name="critterSize"
              required
              min="1"
              max="10"
              step="1"
            />
            <div class="inputRange">
              <p class="inputRangeText">Slow &amp; Big</p>
              <p class="inputRangeText">Fast &amp; Small</p>
            </div>
            <label for="scaredRadius">Scared Radius:</label>
            <input
              type="range"
              id="scaredRadius"
              name="scaredRadius"
              required
              min="1"
              max="100"
              step="1"
            />
            <div class="inputRange">
              <p class="inputRangeText">Small</p>
              <p class="inputRangeText">Large</p>
            </div>
            <label for="safetyRadius">Safety Radius:</label>
            <input
              type="range"
              id="safetyRadius"
              name="safetyRadius"
              required
              min="1"
              max="100"
              step="1"
            />
            <div class="inputRange">
              <p class="inputRangeText">Small</p>
              <p class="inputRangeText">Large</p>
            </div>
          </div>
        </div>
        <button class="btn" id="randomiseBtn">Randomise Species</button>
        <button class="btn" id="selectLevelBtn">Select Level</button>
      </div>
`;

const gameOverText = (endType, duration) => `
    <div id="gameOver" class="gameOver">
        <h2> ${endType === 'won' ? 'WINNER' : 'LOSER'} </h2>
        <p> You ${
          endType === 'won' ? 'won in ' : 'survived for '
        } ${duration} seconds </p>
        <button class="btn" id="playAgainBtn">Play Again?</button>
    </div>
`;

const levelSelectText = () =>
  `<div class="levelsSelectWrapper">
        ${levels
          .map((l, idx) => levelText(idx, l.name, l.description, l.difficulty))
          .join(' ')}
      </div>
      <button class="btn" id="playBtn">Play</button>
`;

const levelText = (idx, name, description, difficulty) => `
<div class="levelWrapper" id=${idx}>
    <h2> ${name}</h2>
    <p class="levelDescription">${description} </p>
    <p class="levelRating">Difficulty: ${difficulty} </p>
</div>
`;

export { canvasText, menuText, gameOverText, levelSelectText };
