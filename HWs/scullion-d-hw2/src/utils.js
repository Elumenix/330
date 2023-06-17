const makeColor = (red, green, blue, alpha = 1) => {
  return `rgba(${red},${green},${blue},${alpha})`;
};

const getRandom = (min, max) => {
  return Math.random() * (max - min) + min;
};

const getRandomColor = () => {
  const floor = 35; // so that colors are not too bright or too dark 
  const getByte = () => getRandom(floor, 255 - floor);
  return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

const getLinearGradient = (ctx, canvasWidth, canvasHeight, gradientData) => {
  let gradientLength = Math.sqrt((canvasWidth * canvasWidth) * .8 + (canvasHeight * canvasHeight) * .8);
  let angleInRadians = gradientData.angle * Math.PI / 180;
  let startX = canvasWidth / 2 - Math.cos(angleInRadians) * gradientLength / 2;
  let startY = canvasHeight / 2 - Math.sin(angleInRadians) * gradientLength / 2;
  let endX = canvasWidth / 2 + Math.cos(angleInRadians) * gradientLength / 2;
  let endY = canvasHeight / 2 + Math.sin(angleInRadians) * gradientLength / 2;

  // Create the linear gradient
  let lg = ctx.createLinearGradient(startX, startY, endX, endY);

  // Add the color stops to the gradient
  for (let stop of gradientData.colorStops) {
    lg.addColorStop(stop.percent, stop.color);
  }

  return lg;
};



// https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
const goFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullscreen) {
    element.mozRequestFullscreen();
  } else if (element.mozRequestFullScreen) { // camel-cased 'S' was changed to 's' in spec
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  }
  // .. and do nothing if the method is not supported
};

export { makeColor, getRandomColor, getLinearGradient, goFullscreen };
