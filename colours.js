const randomColour = (() => {
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  return () => {
    const h = randomInt(0, 360);
    const s = randomInt(42, 98);
    const l = randomInt(40, 90);
    return `hsl(${h},${s}%,${l}%)`;
  };
})();
const componentToHex = (c) => {
  const hex = c.toString(16);
  return hex.length == 1 ? `0${  hex}` : hex;
};
const rgbToHex = (r, g, b) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

const lightenHexColour = (c) => {
  const cr = componentToHex(c);
  const clr = hexToRgb(cr);
  clr.r *= 1.2;
  clr.g *= 1.2;
  clr.b *= 1.2;
  return rgbToHex(clr);
};


export { randomColour, lightenHexColour };
